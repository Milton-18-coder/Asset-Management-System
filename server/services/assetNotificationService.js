import { getPool } from '../db.js';
import { sendAssetStatusNotificationEmail, isEmailConfigured } from './emailService.js';
import { sendAssetStatusWhatsApp, isWhatsAppConfigured, normalizePhoneNumber } from './whatsappService.js';

/**
 * Normalize role strings into standard system roles: 'superadmin' or 'deptadmin'
 */
export function normalizeRole(role) {
  if (!role) return '';
  const clean = String(role).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'deptadmin' || clean === 'departmentadmin' || clean.includes('deptadmin') || clean.includes('departmentadmin')) {
    return 'deptadmin';
  }
  if (clean === 'superadmin' || clean === 'superadministrator' || clean.includes('superadmin')) {
    return 'superadmin';
  }
  return clean;
}

/**
 * Centralized Two-Way Asset Status/Condition Change Notification Dispatcher
 * 
 * Flows:
 * 1. Dept Admin -> Super Admin: Intimation dispatched to all Super Admins
 * 2. Super Admin -> Dept Admin: Intimation dispatched ONLY to the Dept Admin(s) of the asset's department
 */
export async function notifyAssetStatusChange({
  asset,
  previousAsset,
  updatedBy
}) {
  if (!asset) {
    return { triggered: false, reason: 'No asset provided' };
  }

  const prevCond = previousAsset?.condition || null;
  const newCond = asset.condition || null;
  const prevStat = previousAsset?.status || null;
  const newStat = asset.status || null;

  const conditionChanged = Boolean(prevCond && newCond && prevCond !== newCond);
  const statusChanged = Boolean(prevStat && newStat && prevStat !== newStat);

  // Trigger ONLY when actual condition or status changes
  if (!conditionChanged && !statusChanged) {
    return {
      triggered: false,
      reason: 'No meaningful condition or status change detected'
    };
  }

  // Identify & normalize editor role
  const rawRole = updatedBy?.role || '';
  const normRole = normalizeRole(rawRole);

  if (normRole !== 'deptadmin' && normRole !== 'superadmin') {
    return {
      triggered: false,
      skipped: true,
      reason: `Editor role "${rawRole}" is not eligible for Super Admin ↔ Department Admin automated notification workflow`
    };
  }

  const pool = getPool();
  const editorId = updatedBy?.id || '';
  let direction = '';
  let recipients = [];

  try {
    if (normRole === 'deptadmin') {
      direction = 'deptadmin_to_superadmin';
      const [rows] = await pool.query(
        `SELECT id, username, name, role, department, email, phone 
         FROM users 
         WHERE role = 'superadmin' AND id != ?`,
        [editorId]
      );
      recipients = rows;
    } else if (normRole === 'superadmin') {
      direction = 'superadmin_to_deptadmin';
      const assetDept = asset.department || '';

      // 1. Try exact department match first
      const [exactRows] = await pool.query(
        `SELECT id, username, name, role, department, email, phone 
         FROM users 
         WHERE role = 'deptadmin' AND department = ? AND id != ?`,
        [assetDept, editorId]
      );

      if (exactRows && exactRows.length > 0) {
        recipients = exactRows;
      } else {
        // Fallback with fuzzy matching for legacy department names
        const [fuzzyRows] = await pool.query(
          `SELECT id, username, name, role, department, email, phone 
           FROM users 
           WHERE role = 'deptadmin' 
             AND (department = ? OR ? LIKE CONCAT('%', department, '%') OR department LIKE CONCAT('%', ?, '%'))
             AND id != ?`,
          [assetDept, assetDept, assetDept, editorId]
        );
        recipients = fuzzyRows;
      }
    }

    console.log(`[Asset Notification] Asset ${asset.id} updated by ${normRole} ${updatedBy?.id || updatedBy?.name || ''}.`);
    console.log(`[Asset Notification] Recipients determined: ${recipients.map(r => `${r.role === 'superadmin' ? 'Super Admin' : 'Department Admin'}: ${r.id} (${r.name})`).join(', ') || 'None'}`);

    if (!recipients || recipients.length === 0) {
      return {
        triggered: true,
        direction,
        recipients: [],
        reason: 'No eligible recipient users found in database'
      };
    }

    const editorName = updatedBy?.name || updatedBy?.username || (normRole === 'superadmin' ? 'Super Admin' : 'Department Admin');
    const recipientResults = [];

    // Process notification channels for each recipient
    for (const recipient of recipients) {
      let inAppStatus = 'skipped';
      let emailStatus = 'skipped';
      let whatsappStatus = 'skipped';

      // 1. In-App Notification (Stored per recipient)
      try {
        const notifId = `NOTIF-AS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const notifTitle = 'Asset Condition Updated';
        const notifMsg = direction === 'deptadmin_to_superadmin'
          ? `${asset.department || 'Department'} Admin (${editorName}) updated ${asset.id} from ${prevCond || 'N/A'} to ${newCond || 'N/A'}.`
          : `Super Admin (${editorName}) updated ${asset.id} from ${prevCond || 'N/A'} to ${newCond || 'N/A'}.`;

        await pool.query(
          `INSERT INTO notifications (
             id, title, message, time, \`read\`, department, recipient_user_id, recipient_role,
             notification_channel, asset_id, direction, status, type, link
           ) VALUES (?, ?, ?, 'Just now', 0, ?, ?, ?, 'in-app', ?, ?, 'created', 'asset', ?)`,
          [
            notifId,
            notifTitle,
            notifMsg,
            asset.department || null,
            recipient.id,
            recipient.role,
            asset.id,
            direction,
            `/assets/${asset.id}`
          ]
        );
        inAppStatus = 'created';
        console.log(`[Asset Notification] Internal notification: CREATED for ${recipient.id}`);
      } catch (err) {
        console.warn(`[Asset Notification] Internal notification failed for ${recipient.id}:`, err.message);
        inAppStatus = 'failed';
      }

      // 2. Email Notification Dispatch
      try {
        if (recipient.email) {
          const emailRes = await sendAssetStatusNotificationEmail({
            asset,
            previousCondition: prevCond,
            newCondition: newCond,
            previousStatus: prevStat,
            newStatus: newStat,
            updatedBy,
            recipients: [recipient],
            direction
          });
          emailStatus = emailRes.status || (emailRes.success ? 'sent' : 'failed');
        } else {
          emailStatus = 'skipped';
        }
      } catch (err) {
        console.warn(`[Asset Notification] Email dispatch error for ${recipient.id}:`, err.message);
        emailStatus = 'failed';
      }
      console.log(`[Asset Notification] Email: ${emailStatus.toUpperCase()}`);

      // 3. WhatsApp Notification Dispatch
      try {
        if (recipient.phone) {
          const waRes = await sendAssetStatusWhatsApp({
            phone: recipient.phone,
            asset,
            previousCondition: prevCond,
            newCondition: newCond,
            previousStatus: prevStat,
            newStatus: newStat,
            updatedBy,
            direction
          });
          whatsappStatus = waRes.status || (waRes.success ? 'sent' : 'failed');
        } else {
          whatsappStatus = 'skipped';
        }
      } catch (err) {
        console.warn(`[Asset Notification] WhatsApp dispatch error for ${recipient.id}:`, err.message);
        whatsappStatus = 'failed';
      }
      console.log(`[Asset Notification] WhatsApp: ${whatsappStatus.toUpperCase()}`);

      recipientResults.push({
        userId: recipient.id,
        name: recipient.name,
        email: recipient.email || null,
        phone: recipient.phone ? normalizePhoneNumber(recipient.phone) : null,
        emailStatus,
        whatsappStatus,
        inAppStatus
      });
    }

    return {
      triggered: true,
      direction,
      recipients: recipientResults
    };

  } catch (error) {
    console.error('[Asset Notification] Central notification dispatch error:', error.message);
    return {
      triggered: true,
      direction,
      error: error.message,
      recipients: []
    };
  }
}
