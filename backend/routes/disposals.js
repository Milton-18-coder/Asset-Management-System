import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all disposals
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM disposals ORDER BY disposalDate DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new disposal
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, assetId, furniture, disposalDate, reason, resaleValue, approvedBy, notes } = req.body;
    const dispId = id || `DSP-${Date.now()}`;

    await pool.query(
      `INSERT INTO disposals (id, assetId, furniture, disposalDate, reason, resaleValue, approvedBy, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dispId, assetId, furniture || '', disposalDate || new Date().toISOString().split('T')[0], reason, resaleValue || 0.00, approvedBy || '', notes || '']
    );

    // Update asset condition to Damaged or delete/flag it
    if (assetId) {
      await pool.query(`UPDATE assets SET \`condition\` = 'Damaged', status = 'Needs Inspection' WHERE id = ?`, [assetId]);
    }

    const [rows] = await pool.query('SELECT * FROM disposals WHERE id = ?', [dispId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
