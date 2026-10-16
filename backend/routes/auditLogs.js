import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all audit logs (with limit & pagination support)
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit || '100', 10);
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?', [limit]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new audit log
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, userId, userName, userRole, action, entity, entityId, details } = req.body;
    const logId = id || `AUD-${Date.now()}`;
    await pool.query(
      `INSERT INTO audit_logs (id, userId, userName, userRole, action, entity, entityId, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, userId || null, userName || '', userRole || '', action, entity, entityId || '', details || '']
    );
    const [rows] = await pool.query('SELECT * FROM audit_logs WHERE id = ?', [logId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
