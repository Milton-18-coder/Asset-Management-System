import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getPool } from '../db.js';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const REPORT_FROM_EMAIL = process.env.REPORT_FROM_EMAIL || 'reports@assetms.campus.edu';

/**
 * Check if SMTP credentials are configured
 */
export function isEmailConfigured() {
  return Boolean(
    SMTP_HOST &&
    SMTP_HOST !== 'smtp.example.com' &&
    SMTP_USER &&
    SMTP_PASSWORD
  );
}

/**
 * Send email report with optional PDF attachment
 */
export async function sendReportEmail({ to, subject, message, pdfBuffer, filename = 'AssetMS_Report.pdf' }) {
  if (!isEmailConfigured()) {
    // Record failed notification
    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, type, link)
         VALUES (?, ?, ?, ?, 0, 'email', '/analytics')`,
        [
          `NOTIF-EM-${Date.now()}`,
          'Email Service Not Configured',
          `Attempted to share report with ${to}, but SMTP configuration is missing in environment variables.`,
          'Just now'
        ]
      );
    } catch (e) {
      // non-blocking
    }

    return {
      success: false,
      configured: false,
      message: 'Email service is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in the server .env file.'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
      }
    });

    const mailOptions = {
      from: `AssetMS System <${REPORT_FROM_EMAIL}>`,
      to,
      subject: subject || 'AssetMS Campus Report',
      text: message || 'Please find attached the AssetMS report.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #4338ca; margin-top: 0;">AssetMS Campus Report</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">${(message || 'Please find attached the latest AssetMS report.').replace(/\n/g, '<br/>')}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">This is an automated intelligence report from AssetMS - Campus Asset Management System.</p>
        </div>
      `,
      attachments: pdfBuffer ? [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);

    // Record success notification
    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, type, link)
         VALUES (?, ?, ?, ?, 0, 'email', '/analytics')`,
        [
          `NOTIF-EM-${Date.now()}`,
          'Report Shared via Email',
          `Report successfully delivered to ${to}. (Message ID: ${info.messageId})`,
          'Just now'
        ]
      );
    } catch (e) {
      // non-blocking
    }

    return {
      success: true,
      configured: true,
      messageId: info.messageId,
      message: `Report successfully dispatched to ${to}.`
    };

  } catch (error) {
    console.error('SMTP Email dispatch failed:', error);

    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, type, link)
         VALUES (?, ?, ?, ?, 0, 'email', '/analytics')`,
        [
          `NOTIF-EM-${Date.now()}`,
          'Email Dispatch Failed',
          `Failed to deliver report to ${to}: ${error.message}`,
          'Just now'
        ]
      );
    } catch (e) {
      // non-blocking
    }

    return {
      success: false,
      configured: true,
      error: error.message,
      message: `Failed to send email: ${error.message}`
    };
  }
}

/**
 * Send automated email intimation when an asset's condition is edited:
 * 1. If edited by Department Admin ('deptadmin'): Intimation goes ONLY to the Super Admin ('superadmin').
 * 2. If edited by Super Admin ('superadmin'): Intimation goes ONLY to the respective Department Admin ('deptadmin') of that asset's department.
 */
export async function sendAssetConditionIntimationEmail({ asset, previousCondition, newCondition, updatedBy }) {
  if (!asset || !newCondition) return { success: false, reason: 'Invalid payload' };

  try {
    const pool = getPool();
    
    // Normalize editor role
    const rawRole = (updatedBy?.role || '').toLowerCase().replace(/[\s_-]/g, '');
    const isDeptAdmin = rawRole === 'deptadmin' || rawRole === 'departmentadmin';
    const isSuperAdmin = rawRole === 'superadmin' || rawRole === 'superadministrator';

    if (!isDeptAdmin && !isSuperAdmin) {
      console.log(`[Email Intimation] Editor role "${updatedBy?.role}" is neither deptadmin nor superadmin. Skipping email dispatch.`);
      return { success: false, skipped: true, reason: 'Role not applicable for condition intimation' };
    }

    let recipients = [];
    let recipientRoleDesc = '';

    if (isDeptAdmin) {
      // Dept Admin edited -> Send intimation ONLY to Super Admin(s)
      recipientRoleDesc = 'Super Admin';
      const [superAdmins] = await pool.query(
        `SELECT id, name, email, role, department FROM users WHERE role = 'superadmin' AND email IS NOT NULL AND email != ''`
      );
      recipients = superAdmins;
    } else if (isSuperAdmin) {
      // Super Admin edited -> Send intimation ONLY to the respective Department Admin
      const assetDept = asset.department || '';
      recipientRoleDesc = `Department Admin (${assetDept || 'Asset Department'})`;
      const [deptAdmins] = await pool.query(
        `SELECT id, name, email, role, department FROM users 
         WHERE role = 'deptadmin' AND (department = ? OR ? LIKE CONCAT('%', department, '%') OR department LIKE CONCAT('%', ?, '%'))
         AND email IS NOT NULL AND email != ''`,
        [assetDept, assetDept, assetDept]
      );
      recipients = deptAdmins;
    }

    if (!recipients || recipients.length === 0) {
      console.warn(`[Email Intimation] No recipient email found for target ${recipientRoleDesc}.`);
      // Record internal notification
      try {
        await pool.query(
          `INSERT INTO notifications (id, title, message, time, \`read\`, department, type, link)
           VALUES (?, ?, ?, ?, 0, ?, 'email', ?)`,
          [
            `NOTIF-COND-${Date.now()}`,
            'Condition Change Intimation (No Recipient Email)',
            `Asset ${asset.name} (${asset.id}) condition changed from "${previousCondition || 'N/A'}" to "${newCondition}". No active email found for ${recipientRoleDesc}.`,
            'Just now',
            asset.department || null,
            `/assets/${asset.id}`
          ]
        );
      } catch (e) {
        // non-blocking
      }
      return { success: false, configured: isEmailConfigured(), message: `No active email found for ${recipientRoleDesc}` };
    }

    const recipientEmails = recipients.map(r => r.email).filter(Boolean);
    const to = recipientEmails.join(', ');
    const editorName = updatedBy?.name || updatedBy?.username || (isDeptAdmin ? 'Department Admin' : 'Super Admin');
    const editorEmail = updatedBy?.email || 'Not Provided';
    const editorRoleDisplay = isDeptAdmin ? 'Department Admin' : 'Super Admin';

    const subject = isDeptAdmin
      ? `[AssetMS Alert] Asset Condition Updated in ${asset.department}: ${asset.name} (${asset.id})`
      : `[AssetMS Notice] Super Admin Updated Asset Condition in ${asset.department}: ${asset.name} (${asset.id})`;

    const conditionColors = {
      'Good': '#059669',
      'Fair': '#d97706',
      'Poor': '#ea580c',
      'Damaged': '#dc2626'
    };

    const prevColor = conditionColors[previousCondition] || '#64748b';
    const newColor = conditionColors[newCondition] || '#64748b';

    const changeTimestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); padding: 24px 28px; color: #ffffff;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #c7d2fe;">AssetMS Automated Intimation</p>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff;">Asset Condition State Modified</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #e0e7ff;">Target Recipient: <strong>${recipientRoleDesc}</strong></p>
        </div>

        <!-- Body Container -->
        <div style="padding: 28px;">
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">
            This is an official notification to inform you that the physical condition status of an institutional asset has been updated in the campus registry.
          </p>

          <!-- Condition Transition Banner -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Condition Transition</div>
            <div style="display: inline-flex; align-items: center; gap: 12px; justify-content: center;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; background-color: ${prevColor}15; color: ${prevColor}; border: 1px solid ${prevColor}40;">
                ${previousCondition || 'Initial State'}
              </span>
              <span style="font-size: 16px; font-weight: bold; color: #94a3b8;">➔</span>
              <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 14px; background-color: ${newColor}20; color: ${newColor}; border: 2px solid ${newColor};">
                ${newCondition}
              </span>
            </div>
          </div>

          <!-- Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 35%;">Asset ID</td>
                <td style="padding: 10px 0; font-weight: 700; font-family: monospace; color: #4338ca; font-size: 14px;">${asset.id}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Asset Name</td>
                <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${asset.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Department</td>
                <td style="padding: 10px 0; font-weight: 700; color: #1e293b;">${asset.department || 'General'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Location</td>
                <td style="padding: 10px 0; color: #334155;">Room ${asset.room || 'N/A'}, ${asset.building || 'Campus Block'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Assigned Custodian</td>
                <td style="padding: 10px 0; color: #334155;">${asset.assignedTo || 'Unassigned'} ${asset.assignedRole ? `(${asset.assignedRole})` : ''}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Action Performed By</td>
                <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${editorName} <span style="font-size: 11px; font-weight: 600; color: #6366f1; background: #eef2ff; padding: 2px 6px; border-radius: 4px;">${editorRoleDisplay}</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Editor Contact</td>
                <td style="padding: 10px 0; color: #475569;">${editorEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Timestamp</td>
                <td style="padding: 10px 0; color: #475569;">${changeTimestamp}</td>
              </tr>
            </tbody>
          </table>

          <!-- Intimation Directive Note -->
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #15803d; line-height: 1.5;">
              <strong>Intimation Directive:</strong> ${isDeptAdmin ? 'Department Admin modified asset condition ➔ Intimation dispatched exclusively to Super Admin.' : 'Super Admin modified asset condition ➔ Intimation dispatched exclusively to the respective Department Admin.'}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          <p style="margin: 0 0 4px 0;">AssetMS – Campus Furniture & Asset Management System</p>
          <p style="margin: 0;">This is an automated system email intimation. Please do not reply directly to this email.</p>
        </div>
      </div>
    `;

    if (!isEmailConfigured()) {
      console.log(`[Email Intimation] SMTP is in local simulation mode. Intimation target: ${recipientRoleDesc} (${to})`);
      // Record internal notification in system
      try {
        await pool.query(
          `INSERT INTO notifications (id, title, message, time, \`read\`, department, type, link)
           VALUES (?, ?, ?, ?, 0, ?, 'condition_intimation', ?)`,
          [
            `NOTIF-COND-${Date.now()}`,
            `Asset Condition Intimation: ${asset.name}`,
            `[Email Intimation to ${recipientRoleDesc} (${to})] Condition of ${asset.name} (${asset.id}) in ${asset.department} updated from "${previousCondition || 'N/A'}" to "${newCondition}" by ${editorName} (${editorRoleDisplay}).`,
            'Just now',
            asset.department || null,
            `/assets/${asset.id}`
          ]
        );
      } catch (e) {
        // non-blocking
      }
      return {
        success: true,
        simulated: true,
        configured: false,
        recipients: recipientEmails,
        message: `Intimation recorded for ${recipientRoleDesc} (${to}).`
      };
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
      }
    });

    const mailOptions = {
      from: `AssetMS System <${REPORT_FROM_EMAIL}>`,
      to,
      subject,
      text: `AssetMS Intimation: Asset ${asset.name} (${asset.id}) in ${asset.department} condition changed from ${previousCondition} to ${newCondition} by ${editorName} (${editorRoleDisplay}).`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Intimation] Email dispatched successfully to ${to}. MessageId: ${info.messageId}`);

    // Record notification
    try {
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, department, type, link)
         VALUES (?, ?, ?, ?, 0, ?, 'condition_intimation', ?)`,
        [
          `NOTIF-COND-${Date.now()}`,
          `Condition Intimation Sent to ${recipientRoleDesc}`,
          `Condition change intimation for ${asset.name} (${asset.id}) delivered to ${to}.`,
          'Just now',
          asset.department || null,
          `/assets/${asset.id}`
        ]
      );
    } catch (e) {
      // non-blocking
    }

    return {
      success: true,
      configured: true,
      messageId: info.messageId,
      recipients: recipientEmails,
      message: `Intimation successfully dispatched to ${recipientRoleDesc} (${to}).`
    };
  } catch (error) {
    console.error('[Email Intimation] Failed to send email:', error.message);
    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, department, type, link)
         VALUES (?, ?, ?, ?, 0, ?, 'condition_intimation', ?)`,
        [
          `NOTIF-COND-${Date.now()}`,
          `Condition Intimation Failed`,
          `Failed to deliver email: ${error.message}`,
          'Just now',
          asset.department || null,
          `/assets/${asset.id}`
        ]
      );
    } catch (e) {
      // non-blocking
    }
    return {
      success: false,
      configured: true,
      error: error.message,
      message: `Failed to deliver email intimation: ${error.message}`
    };
  }
}

