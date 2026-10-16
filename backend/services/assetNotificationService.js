import { getPool } from '../db.js';
import { sendAssetStatusNotificationEmail, isEmailConfigured, isValidEmail } from './emailService.js';
import { sendAssetStatusWhatsApp, normalizePhoneNumber } from './whatsappService.js';

/**
 * Normalize role strings into standard system roles: 'superadmin' or 'deptadmin'
 */
export function normalizeRole(role) {
  if (!role) return '';
  const clean = String(role).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'deptadmin' || clean === 'departmentadmin' || clean.includes('deptadmin') || clean.includes('departmentadmin') || clean.includes('dept')) {
    return 'deptadmin';
  }
  if (clean === 'superadmin' || clean === 'superadministrator' || clean.includes('superadmin')) {
    return 'superadmin';
  }
  return clean;
}

/**
 * Common Recipient Resolver
 * 
 * Determines notification targets based on the updater's role and asset's department:
 * - If updater is Department Admin: Targets all Super Admins (excluding updater)
 * - If updater is Super Admin: Targets Department Admins belonging to the asset's department (excluding updater)
 * 
 * @param {Object} asset The asset being modified
 * @param {Object} updater The authenticated user performing the update
 * @returns {Promise<{superAdmins: Array, departmentAdmins: Array, recipients: Array}>}
 */
export async function getAssetNotificationRecipients(asset, updater) {
  const pool = getPool();
  const rawRole = updater?.role || '';
  const normRole = normalizeRole(rawRole);
  const updaterId = updater?.id || '';
  const assetDept = asset?.department || '';

  let superAdmins = [];
  let departmentAdmins = [];
  let recipients = [];

  if (normRole === 'deptadmin') {
    // Case A: Department Admin updates asset -> Recipient is all Super Admins
    const [rows] = await pool.query(
      `SELECT id, username, name, role, department, email, phone 
       FROM users 
       WHERE role = 'superadmin' AND (id != ? OR ? = '')`,
      [updaterId, updaterId]
    );
    superAdmins = rows;
    recipients = rows;
  } else if (normRole === 'superadmin') {
    // Case B: Super Admin updates asset -> Recipient is Department Admin(s) of asset's department
    const [exactRows] = await pool.query(
      `SELECT id, username, name, role, department, email, phone 
       FROM users 
       WHERE role = 'deptadmin' 
         AND (department = ? OR LOWER(TRIM(department)) = LOWER(TRIM(?)))
         AND (id != ? OR ? = '')`,
      [assetDept, assetDept, updaterId, updaterId]
    );

    if (exactRows && exactRows.length > 0) {
      departmentAdmins = exactRows;
      recipients = exactRows;
    } else {
      // Fallback with fuzzy matching for department variations
      const [fuzzyRows] = await pool.query(
        `SELECT id, username, name, role, department, email, phone 
         FROM users 
         WHERE role = 'deptadmin' 
           AND (department = ? OR ? LIKE CONCAT('%', department, '%') OR department LIKE CONCAT('%', ?, '%'))
           AND (id != ? OR ? = '')`,
        [assetDept, assetDept, assetDept, updaterId, updaterId]
      );
      departmentAdmins = fuzzyRows;
      recipients = fuzzyRows;
    }
  }

  return {
    superAdmins,
    departmentAdmins,
    recipients
  };
}

/**
 * Centralized Two-Way Asset Status & Condition Change Notification Dispatcher
 * 
 * Rules:
 * 1. Checks actual previous condition vs new condition before triggering.
 * 2. Resolves recipients using getAssetNotificationRecipients.
 * 3. Dispatches Email, WhatsApp, and In-App notifications consistently.
 * 4. Never crashes the asset update on email or notification failure.
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

  // Send email and notifications ONLY when condition or status actually changes
  if (!conditionChanged && !statusChanged) {
    return {
      triggered: false,
      reason: 'No meaningful condition or status change detected'
    };
  }

  const pool = getPool();

  // Load authenticated user from DB if id or username provided to guarantee trusted role and department
  let trustedUpdater = updatedBy;
  if (updatedBy?.id || updatedBy?.username) {
    try {
      const [userRows] = await pool.query(
        `SELECT id, username, name, role, department, email, phone 
         FROM users 
         WHERE id = ? OR username = ?`,
        [updatedBy.id || '', updatedBy.username || '']
      );
      if (userRows && userRows.length > 0) {
        trustedUpdater = userRows[0];
      }
    } catch (e) {
      // Fallback to provided object
    }
  }

  // Identify & normalize editor role
  const rawRole = trustedUpdater?.role || '';
  const normRole = normalizeRole(rawRole);

  if (normRole !== 'deptadmin' && normRole !== 'superadmin') {
    return {
      triggered: false,
      skipped: true,
      reason: `Editor role "${rawRole}" is not eligible for Super Admin ↔ Department Admin automated notification workflow`
    };
  }

  const direction = normRole === 'deptadmin' ? 'deptadmin_to_superadmin' : 'superadmin_to_deptadmin';

  try {
    const { recipients } = await getAssetNotificationRecipients(asset, trustedUpdater);

    if (!recipients || recipients.length === 0) {
      console.log(`[AssetNotification] ${asset.id} ${prevCond || 'N/A'} -> ${newCond || 'N/A'}`);
      console.log(`[AssetNotification] Updated by: ${trustedUpdater?.name || 'N/A'} | Role: ${normRole}`);
      console.log(`[AssetNotification] No eligible recipient users found in database`);

      return {
        triggered: true,
        direction,
        recipients: [],
        email: {
          status: 'skipped',
          recipients: 0,
          sentCount: 0,
          failedCount: 0,
          skippedCount: 0
        },
        whatsapp: { status: 'skipped' },
        inApp: { status: 'skipped' },
        reason: 'No eligible recipient users found in database'
      };
    }

    const editorName = trustedUpdater?.name || trustedUpdater?.username || (normRole === 'superadmin' ? 'Super Admin' : 'Department Admin');
    const recipientResults = [];
    let totalSentEmails = 0;
    let totalFailedEmails = 0;
    let totalSkippedEmails = 0;

    // Process notification channels for each recipient
    for (const recipient of recipients) {
      let inAppStatus = 'skipped';
      let emailStatus = 'skipped';
      let whatsappStatus = 'skipped';

      // 1. In-App Notification (Stored per recipient in database)
      try {
        const notifId = `NOTIF-AS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const notifTitle = 'Asset Condition Updated';
        const notifMsg = direction === 'deptadmin_to_superadmin'
          ? `Department Admin (${editorName}) updated ${asset.id} from ${prevCond || 'N/A'} to ${newCond || 'N/A'}.`
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
      } catch (err) {
        console.warn(`[AssetNotification] In-app notification failed for recipient ${recipient.id}:`, err.message);
        inAppStatus = 'failed';
      }

      // 2. Email Notification Dispatch
      const recipientEmail = recipient.email ? recipient.email.trim() : null;
      if (isValidEmail(recipientEmail)) {
        try {
          const emailRes = await sendAssetStatusNotificationEmail({
            asset,
            previousCondition: prevCond,
            newCondition: newCond,
            previousStatus: prevStat,
            newStatus: newStat,
            updatedBy: trustedUpdater,
            recipients: [recipient],
            direction
          });

          if (emailRes.success || emailRes.status === 'sent') {
            emailStatus = 'sent';
            totalSentEmails++;
            console.log(`[AssetNotification]\n${asset.id}\n${prevCond || 'N/A'} -> ${newCond || 'N/A'}\nUpdated by: ${editorName}\nRole: ${normRole}\nEmail recipient: ${recipientEmail}\nEmail status: SENT`);
          } else if (emailRes.status === 'skipped') {
            emailStatus = 'skipped';
            totalSkippedEmails++;
          } else {
            emailStatus = 'failed';
            totalFailedEmails++;
            console.log(`[AssetNotification]\n${asset.id}\nEmail FAILED\nRecipient: ${recipientEmail}\nReason: ${emailRes.error || emailRes.message || 'SMTP delivery failed'}`);
          }
        } catch (err) {
          emailStatus = 'failed';
          totalFailedEmails++;
          console.log(`[AssetNotification]\n${asset.id}\nEmail FAILED\nRecipient: ${recipientEmail}\nReason: ${err.message}`);
        }
      } else {
        emailStatus = 'skipped';
        totalSkippedEmails++;
        if (recipient.email) {
          console.log(`[AssetNotification] Skipped invalid email "${recipient.email}" for recipient ${recipient.name} (${recipient.id})`);
        }
      }

      // 3. WhatsApp Notification Dispatch
      if (recipient.phone) {
        try {
          const waRes = await sendAssetStatusWhatsApp({
            phone: recipient.phone,
            asset,
            previousCondition: prevCond,
            newCondition: newCond,
            previousStatus: prevStat,
            newStatus: newStat,
            updatedBy: trustedUpdater,
            direction
          });
          whatsappStatus = waRes.status || (waRes.success ? 'sent' : 'failed');
        } catch (err) {
          console.warn(`[AssetNotification] WhatsApp dispatch error for ${recipient.id}:`, err.message);
          whatsappStatus = 'failed';
        }
      } else {
        whatsappStatus = 'skipped';
      }

      recipientResults.push({
        userId: recipient.id,
        name: recipient.name,
        role: recipient.role,
        email: recipientEmail,
        phone: recipient.phone ? normalizePhoneNumber(recipient.phone) : null,
        emailStatus,
        whatsappStatus,
        inAppStatus
      });
    }

    // Determine overall email status
    let overallEmailStatus = 'skipped';
    if (totalSentEmails > 0 && totalFailedEmails === 0) {
      overallEmailStatus = 'sent';
    } else if (totalSentEmails > 0 && totalFailedEmails > 0) {
      overallEmailStatus = 'partial';
    } else if (totalFailedEmails > 0) {
      overallEmailStatus = 'failed';
    }

    return {
      triggered: true,
      direction,
      email: {
        status: overallEmailStatus,
        recipients: recipients.length,
        sentCount: totalSentEmails,
        failedCount: totalFailedEmails,
        skippedCount: totalSkippedEmails
      },
      whatsapp: {
        status: recipientResults.some(r => r.whatsappStatus === 'sent') ? 'sent' : (recipientResults.some(r => r.whatsappStatus === 'failed') ? 'failed' : 'skipped')
      },
      inApp: {
        status: recipientResults.some(r => r.inAppStatus === 'created') ? 'created' : 'failed'
      },
      recipients: recipientResults
    };

  } catch (error) {
    console.error('[AssetNotification] Central notification dispatch error:', error.message);
    return {
      triggered: true,
      direction,
      error: error.message,
      email: {
        status: 'failed',
        error: error.message
      },
      recipients: []
    };
  }
}

