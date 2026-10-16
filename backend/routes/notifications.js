import { Router } from 'express';
import { getPool } from '../db.js';
import { sendAssetStatusNotificationEmail, isValidEmail, isEmailConfigured } from '../services/emailService.js';

const router = Router();

// POST test email delivery (Admin development / validation endpoint)
router.post('/test-email', async (req, res) => {
  try {
    const { recipient, updatedBy } = req.body;

    if (!recipient || !isValidEmail(recipient)) {
      return res.status(400).json({
        success: false,
        error: 'A valid recipient email address is required (e.g. admin@example.com)'
      });
    }

    if (!isEmailConfigured()) {
      return res.status(200).json({
        success: false,
        configured: false,
        status: 'skipped',
        message: 'SMTP credentials are not configured in environment variables'
      });
    }

    // Mock asset payload for testing
    const sampleAsset = {
      id: 'AST-TEST-001',
      name: 'Dell Latitude 7420 Laptop',
      department: updatedBy?.department || 'Computer Science'
    };

    const result = await sendAssetStatusNotificationEmail({
      asset: sampleAsset,
      previousCondition: 'Good',
      newCondition: 'Damaged',
      updatedBy: updatedBy || { name: 'System Administrator', role: 'superadmin' },
      recipients: [{ email: recipient, name: 'Test Recipient', id: 'TEST-USER' }],
      direction: 'deptadmin_to_superadmin'
    });

    res.json({
      success: result.success,
      configured: result.configured,
      status: result.status,
      recipient,
      message: result.success
        ? `Test notification email successfully delivered to ${recipient}`
        : `Email dispatch failed: ${result.error || result.message}`
    });
  } catch (error) {
    console.error('[Notification Route] Test email error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET notifications (supports filtering by userId, role, and department)
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const { userId, role, department } = req.query;

    let sql = 'SELECT * FROM notifications';
    const params = [];

    if (userId || role || department) {
      const rawRole = (role || '').toLowerCase().replace(/[\s_-]/g, '');
      const isSuperAdmin = rawRole === 'superadmin' || rawRole === 'superadministrator';
      const isDeptAdmin = rawRole === 'deptadmin' || rawRole === 'departmentadmin';

      if (isSuperAdmin) {
        sql += ` WHERE recipient_user_id = ? 
                    OR recipient_role = 'superadmin' 
                    OR department = 'All' 
                    OR (recipient_user_id IS NULL AND (department IS NULL OR department = 'Admin Block' OR department = 'All'))`;
        params.push(userId || '');
      } else if (isDeptAdmin) {
        const userDept = department || '';
        sql += ` WHERE recipient_user_id = ? 
                    OR (recipient_role = 'deptadmin' AND (department = ? OR department = 'All'))
                    OR (recipient_user_id IS NULL AND (department = ? OR department = 'All' OR department IS NULL))`;
        params.push(userId || '', userDept, userDept);
      } else {
        const userDept = department || '';
        sql += ` WHERE recipient_user_id = ? 
                    OR (recipient_user_id IS NULL AND (department = ? OR department = 'All' OR department IS NULL))`;
        params.push(userId || '', userDept);
      }
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(r => ({ ...r, read: Boolean(r.read) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new notification
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const n = req.body;
    await pool.query(
      `INSERT INTO notifications (
         id, title, message, time, \`read\`, department, recipient_user_id, recipient_role,
         notification_channel, asset_id, direction, status, type, link
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        n.id,
        n.title,
        n.message,
        n.time || 'Just now',
        n.read ? 1 : 0,
        n.department || null,
        n.recipient_user_id || null,
        n.recipient_role || null,
        n.notification_channel || 'in-app',
        n.asset_id || null,
        n.direction || null,
        n.status || 'created',
        n.type || 'info',
        n.link || ''
      ]
    );
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [n.id]);
    res.status(201).json({ ...rows[0], read: Boolean(rows[0].read) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH mark single as read
router.patch('/:id/read', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('UPDATE notifications SET `read` = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('UPDATE notifications SET `read` = 1');
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE single notification
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE clear all notifications
router.delete('/clear-all', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM notifications');
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

