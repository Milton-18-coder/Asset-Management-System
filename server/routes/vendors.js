import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all vendors
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM vendors ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new vendor
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, name, contactPerson, email, phone, address, gstin, rating, services } = req.body;
    const vendorId = id || `VND-${Date.now()}`;
    await pool.query(
      `INSERT INTO vendors (id, name, contactPerson, email, phone, address, gstin, rating, services)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), contactPerson=VALUES(contactPerson), email=VALUES(email), phone=VALUES(phone), address=VALUES(address), gstin=VALUES(gstin), rating=VALUES(rating), services=VALUES(services)`,
      [vendorId, name, contactPerson || '', email || '', phone || '', address || '', gstin || '', rating || 4.5, services || '']
    );
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update vendor
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { name, contactPerson, email, phone, address, gstin, rating, services } = req.body;
    await pool.query(
      `UPDATE vendors SET name = ?, contactPerson = ?, email = ?, phone = ?, address = ?, gstin = ?, rating = ?, services = ? WHERE id = ?`,
      [name, contactPerson, email, phone, address, gstin, rating, services, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE vendor
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM vendors WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
