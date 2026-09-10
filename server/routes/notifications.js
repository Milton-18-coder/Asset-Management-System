import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all notifications
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
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
      `INSERT INTO notifications (id, title, message, time, \`read\`, department, type, link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.title, n.message, n.time || 'Just now', n.read ? 1 : 0, n.department || null, n.type || 'info', n.link || '']
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
