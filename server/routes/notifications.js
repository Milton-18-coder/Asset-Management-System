import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

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
