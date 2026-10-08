import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getPool } from '../db.js';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
const REPORT_FROM_EMAIL = process.env.REPORT_FROM_EMAIL || process.env.SMTP_FROM || 'reports@assetms.campus.edu';

/**
 * Format timestamp in Asia/Kolkata timezone (e.g. "08-Oct-2026 10:15 PM IST")
 */
export function formatIndianTimestamp(date = new Date()) {
  try {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Format time in Asia/Kolkata timezone
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const parts = formatter.formatToParts(d);
    let day = String(d.getDate()).padStart(2, '0');
    let month = months[d.getMonth()];
    let year = String(d.getFullYear());
    let hour = '12';
    let minute = '00';
    let period = 'AM';

    for (const part of parts) {
      if (part.type === 'day') day = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'year') year = part.value;
      if (part.type === 'hour') hour = part.value;
      if (part.type === 'minute') minute = part.value;
      if (part.type === 'dayPeriod') period = part.value.toUpperCase();
    }

    return `${day}-${month}-${year} ${hour}:${minute} ${period} IST`;
  } catch (err) {
    return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  }
}

/**
 * Validate an email address format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(clean);
}

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
 * Send email report with optional PDF attachment (Existing reporting functionality)
 */
export async function sendReportEmail({ to, subject, message, pdfBuffer, filename = 'AssetMS_Report.pdf' }) {
  if (!isEmailConfigured()) {
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
      from: `Asset Management System <${REPORT_FROM_EMAIL}>`,
      to,
      subject: subject || 'AssetMS Campus Report',
      text: message || 'Please find attached the AssetMS report.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
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
    console.error('[EmailService] SMTP Report email dispatch failed:', error.message);

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
 * Send automated email notification for asset condition/status change
 * 
 * Generates exact responsive HTML + plain text format matching requirements.
 */
export async function sendAssetStatusNotificationEmail({
  asset,
  previousCondition,
  newCondition,
  previousStatus,
  newStatus,
  updatedBy,
  recipients = [],
  direction
}) {
  if (!asset) {
    return { success: false, reason: 'Invalid asset payload', status: 'failed' };
  }

  // Filter and validate recipient email addresses
  const validRecipients = (recipients || []).filter(r => r && isValidEmail(r.email));
  const recipientEmails = validRecipients.map(r => r.email.trim());

  if (recipientEmails.length === 0) {
    return {
      success: false,
      configured: isEmailConfigured(),
      status: 'skipped',
      recipients: [],
      message: 'No valid recipient email addresses available'
    };
  }

  // Determine role display and updater name
  const rawRole = (updatedBy?.role || '').toLowerCase().replace(/[\s_-]/g, '');
  const isDeptAdmin = direction === 'deptadmin_to_superadmin' || rawRole === 'deptadmin' || rawRole.includes('dept');
  const roleDisplay = isDeptAdmin ? 'Department Admin' : 'Super Admin';
  const updaterName = updatedBy?.name || updatedBy?.username || (isDeptAdmin ? 'Department Admin' : 'Super Admin');

  // Exact Subject line matching requirement: "Asset Status Update - <Asset ID>"
  const subject = `Asset Status Update - ${asset.id}`;

  const formattedTimestamp = formatIndianTimestamp(new Date());

  // Condition Colors
  const conditionColors = {
    'Good': '#059669',
    'Fair': '#d97706',
    'Poor': '#ea580c',
    'Damaged': '#dc2626',
    'Repaired': '#2563eb'
  };

  const prevColor = conditionColors[previousCondition] || '#64748b';
  const newColor = conditionColors[newCondition] || '#64748b';

  // Plain text fallback
  const textContent = [
    'Asset Management System',
    '',
    'ASSET STATUS UPDATE',
    '',
    `Asset ID: ${asset.id}`,
    `Asset Name: ${asset.name || 'N/A'}`,
    `Department: ${asset.department || 'General'}`,
    '',
    `Previous Condition: ${previousCondition || 'N/A'}`,
    `New Condition: ${newCondition || 'N/A'}`,
    '',
    `Updated By: ${updaterName}`,
    `Role: ${roleDisplay}`,
    `Updated At: ${formattedTimestamp}`,
    '',
    'This notification was generated automatically by AssetMS.'
  ].join('\n');

  // Professional, clean, responsive HTML email with inline CSS
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 28px 32px; color: #ffffff;">
          <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #94a3b8;">Asset Management System</p>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Asset Status Update</h1>
        </div>

        <!-- Content Area -->
        <div style="padding: 32px;">
          
          <!-- Condition Change Badge Box -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 28px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Condition Transition</div>
            <table align="center" style="margin: 0 auto; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; background-color: ${prevColor}15; color: ${prevColor}; border: 1px solid ${prevColor}40;">
                  ${previousCondition || 'Initial State'}
                </td>
                <td style="padding: 0 14px; font-size: 18px; font-weight: bold; color: #94a3b8;">➔</td>
                <td style="padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 14px; background-color: ${newColor}20; color: ${newColor}; border: 2px solid ${newColor};">
                  ${newCondition || 'Updated State'}
                </td>
              </tr>
            </table>
          </div>

          <!-- Key Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 11px 0; font-weight: 600; color: #64748b; width: 40%;">Asset ID:</td>
                <td style="padding: 11px 0; font-weight: 800; font-family: monospace; color: #4338ca; font-size: 15px;">${asset.id}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 11px 0; font-weight: 600; color: #64748b;">Asset Name:</td>
                <td style="padding: 11px 0; font-weight: 700; color: #0f172a;">${asset.name || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 11px 0; font-weight: 600; color: #64748b;">Department:</td>
                <td style="padding: 11px 0; font-weight: 700; color: #1e293b;">${asset.department || 'General'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 11px 0; font-weight: 600; color: #64748b;">Previous Condition:</td>
                <td style="padding: 11px 0; font-weight: 700; color: ${prevColor};">${previousCondition || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 11px 0; font-weight: 600; color: #64748b;">New Condition:</td>
                <td style="padding: 11px 0; font-weight: 800; color: ${newColor};">${newCondition || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 11px 0; font-weight: 600; color: #64748b;">Updated By:</td>
                <td style="padding: 11px 0; font-weight: 700; color: #0f172a;">${updaterName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 11px 0; font-weight: 600; color: #64748b;">Role:</td>
                <td style="padding: 11px 0;">
                  <span style="display: inline-block; font-size: 12px; font-weight: 700; color: #4338ca; background: #eef2ff; padding: 3px 10px; border-radius: 6px; border: 1px solid #c7d2fe;">
                    ${roleDisplay}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 11px 0; font-weight: 600; color: #64748b;">Updated At:</td>
                <td style="padding: 11px 0; font-weight: 600; color: #334155;">${formattedTimestamp}</td>
              </tr>
            </tbody>
          </table>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">This notification was generated automatically by AssetMS.</p>
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">Campus Asset & Inventory Management System</p>
        </div>

      </div>
    </body>
    </html>
  `;

  if (!isEmailConfigured()) {
    return {
      success: false,
      configured: false,
      status: 'skipped',
      recipients: recipientEmails,
      message: 'SMTP credentials not configured in environment variables'
    };
  }

  // Send to all eligible recipient email addresses
  const sendResults = [];
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

    for (const email of recipientEmails) {
      try {
        const mailOptions = {
          from: `Asset Management System <${REPORT_FROM_EMAIL}>`,
          to: email,
          subject,
          text: textContent,
          html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        sendResults.push({ email, status: 'sent', messageId: info.messageId });
      } catch (err) {
        sendResults.push({ email, status: 'failed', error: err.message });
      }
    }

    const allSent = sendResults.every(r => r.status === 'sent');
    const anySent = sendResults.some(r => r.status === 'sent');

    return {
      success: anySent,
      configured: true,
      status: allSent ? 'sent' : (anySent ? 'partial' : 'failed'),
      recipients: recipientEmails,
      results: sendResults
    };

  } catch (error) {
    return {
      success: false,
      configured: true,
      status: 'failed',
      error: error.message,
      recipients: recipientEmails,
      results: sendResults
    };
  }
}

/**
 * Send a single status email (alias for sendAssetStatusNotificationEmail)
 */
export async function sendAssetStatusEmail(params) {
  return sendAssetStatusNotificationEmail(params);
}

/**
 * Compatibility wrapper for existing legacy calls
 */
export async function sendAssetConditionIntimationEmail({ asset, previousCondition, newCondition, updatedBy }) {
  const pool = getPool();
  const rawRole = (updatedBy?.role || '').toLowerCase().replace(/[\s_-]/g, '');
  const isDeptAdmin = rawRole === 'deptadmin' || rawRole === 'departmentadmin';

  let recipients = [];
  try {
    if (isDeptAdmin) {
      const [superAdmins] = await pool.query(
        `SELECT id, name, email, phone, role, department FROM users WHERE role = 'superadmin' AND email IS NOT NULL AND email != ''`
      );
      recipients = superAdmins;
    } else {
      const assetDept = asset?.department || '';
      const [deptAdmins] = await pool.query(
        `SELECT id, name, email, phone, role, department FROM users 
         WHERE role = 'deptadmin' AND (department = ? OR ? LIKE CONCAT('%', department, '%') OR department LIKE CONCAT('%', ?, '%'))
         AND email IS NOT NULL AND email != ''`,
        [assetDept, assetDept, assetDept]
      );
      recipients = deptAdmins;
    }
  } catch (e) {
    // Non-blocking
  }

  return sendAssetStatusNotificationEmail({
    asset,
    previousCondition,
    newCondition,
    updatedBy,
    recipients,
    direction: isDeptAdmin ? 'deptadmin_to_superadmin' : 'superadmin_to_deptadmin'
  });
}


