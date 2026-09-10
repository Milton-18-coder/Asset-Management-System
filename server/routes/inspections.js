import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all inspections
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM inspections ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new inspection
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const i = req.body;
    await pool.query(
      `INSERT INTO inspections (id, assetId, furniture, location, \`condition\`, inspector, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`condition\`=VALUES(\`condition\`)`,
      [i.id, i.assetId, i.furniture, i.location, i.condition, i.inspector, i.date || null, i.notes || '']
    );
    const [rows] = await pool.query('SELECT * FROM inspections WHERE id = ?', [i.id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
