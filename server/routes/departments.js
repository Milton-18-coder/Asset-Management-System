import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all departments
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new department
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, name, code, building, hod, admin } = req.body;
    const deptId = id || `D${Date.now()}`;
    await pool.query(
      `INSERT INTO departments (id, name, code, building, hod, admin)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), building=VALUES(building), hod=VALUES(hod), admin=VALUES(admin)`,
      [deptId, name, code, building || '', hod || '', admin || '']
    );
    const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [deptId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update department
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { name, code, building, hod, admin } = req.body;
    await pool.query(
      `UPDATE departments SET name = ?, code = ?, building = ?, hod = ?, admin = ? WHERE id = ?`,
      [name, code, building, hod, admin, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE department
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
