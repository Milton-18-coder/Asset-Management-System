import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new category
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, name, mainCategory, code, icon, depreciationRate, usefulLifeYears, description } = req.body;
    const catId = id || `CAT-${Date.now()}`;
    await pool.query(
      `INSERT INTO categories (id, name, mainCategory, code, icon, depreciationRate, usefulLifeYears, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), mainCategory=VALUES(mainCategory), code=VALUES(code), icon=VALUES(icon), depreciationRate=VALUES(depreciationRate), usefulLifeYears=VALUES(usefulLifeYears), description=VALUES(description)`,
      [catId, name, mainCategory || 'Furniture', code, icon || 'Box', depreciationRate || 10.0, usefulLifeYears || 5, description || '']
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [catId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { name, mainCategory, code, icon, depreciationRate, usefulLifeYears, description } = req.body;
    await pool.query(
      `UPDATE categories SET name = ?, mainCategory = ?, code = ?, icon = ?, depreciationRate = ?, usefulLifeYears = ?, description = ? WHERE id = ?`,
      [name, mainCategory, code, icon, depreciationRate, usefulLifeYears, description, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
