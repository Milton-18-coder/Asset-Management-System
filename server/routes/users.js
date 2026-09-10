import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, username, name, role, department, email, created_at FROM users ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new user
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const u = req.body;
    await pool.query(
      `INSERT INTO users (id, username, password, name, role, department, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name=VALUES(name), role=VALUES(role), department=VALUES(department), email=VALUES(email)`,
      [u.id, u.username, u.password || 'password123', u.name, u.role, u.department || null, u.email || '']
    );
    const [rows] = await pool.query('SELECT id, username, name, role, department, email, created_at FROM users WHERE id = ?', [u.id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const u = req.body;
    await pool.query(
      `UPDATE users SET name=?, role=?, department=?, email=? WHERE id=?`,
      [u.name, u.role, u.department || null, u.email || '', req.params.id]
    );
    const [rows] = await pool.query('SELECT id, username, name, role, department, email, created_at FROM users WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
