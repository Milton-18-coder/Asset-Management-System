import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all transfers
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM transfers ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new transfer
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const t = req.body;
    await pool.query(
      `INSERT INTO transfers (id, assetId, furniture, source, destination, requestedBy, role, department, date, status, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status=VALUES(status)`,
      [t.id, t.assetId, t.furniture, t.source, t.destination, t.requestedBy, t.role, t.department, t.date || null, t.status || 'Pending', t.reason || '']
    );
    const [rows] = await pool.query('SELECT * FROM transfers WHERE id = ?', [t.id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH transfer status
router.patch('/:id/status', async (req, res) => {
  try {
    const pool = getPool();
    const { status } = req.body;
    await pool.query('UPDATE transfers SET status = ? WHERE id = ?', [status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM transfers WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
