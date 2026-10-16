import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all buildings
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM buildings ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new building
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, name, code, floors } = req.body;
    const bldgId = id || `B${Date.now()}`;
    await pool.query(
      `INSERT INTO buildings (id, name, code, floors)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), floors=VALUES(floors)`,
      [bldgId, name, code, floors || 1]
    );
    const [rows] = await pool.query('SELECT * FROM buildings WHERE id = ?', [bldgId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update building
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { name, code, floors } = req.body;
    await pool.query(
      `UPDATE buildings SET name = ?, code = ?, floors = ? WHERE id = ?`,
      [name, code, floors, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE building
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM buildings WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Building deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
