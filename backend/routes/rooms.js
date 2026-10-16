import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all rooms (optionally filtered by department or building)
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const { department, building } = req.query;
    let query = 'SELECT * FROM rooms';
    const params = [];

    if (department && building) {
      query += ' WHERE department = ? AND building = ?';
      params.push(department, building);
    } else if (department) {
      query += ' WHERE department = ?';
      params.push(department);
    } else if (building) {
      query += ' WHERE building = ?';
      params.push(building);
    }

    query += ' ORDER BY number ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new room
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, number, building, department, floor, type, capacity } = req.body;
    const roomId = id || `R${Date.now()}`;
    await pool.query(
      `INSERT INTO rooms (id, number, building, department, floor, type, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE number=VALUES(number), building=VALUES(building), department=VALUES(department), floor=VALUES(floor), type=VALUES(type), capacity=VALUES(capacity)`,
      [roomId, number, building || '', department || '', floor || 1, type || 'Classroom', capacity || 30]
    );
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update room
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { number, building, department, floor, type, capacity } = req.body;
    await pool.query(
      `UPDATE rooms SET number = ?, building = ?, department = ?, floor = ?, type = ?, capacity = ? WHERE id = ?`,
      [number, building, department, floor, type, capacity, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE room
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
