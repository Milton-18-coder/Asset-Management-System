import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// GET all maintenance logs
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM maintenance_logs ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new maintenance log
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { id, assetId, furniture, issueDescription, scheduledDate, completedDate, cost, status, vendor, technicianNotes } = req.body;
    const logId = id || `MNT-${Date.now()}`;
    await pool.query(
      `INSERT INTO maintenance_logs (id, assetId, furniture, issueDescription, scheduledDate, completedDate, cost, status, vendor, technicianNotes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, assetId || '', furniture || '', issueDescription, scheduledDate || null, completedDate || null, cost || 0.00, status || 'Scheduled', vendor || '', technicianNotes || '']
    );

    // Optionally update asset status to Under Maintenance if active
    if (assetId && (status === 'Scheduled' || status === 'In Progress')) {
      await pool.query(`UPDATE assets SET status = 'Under Maintenance' WHERE id = ?`, [assetId]);
    }

    const [rows] = await pool.query('SELECT * FROM maintenance_logs WHERE id = ?', [logId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update maintenance status
router.patch('/:id/status', async (req, res) => {
  try {
    const pool = getPool();
    const { status, completedDate, technicianNotes, cost } = req.body;
    
    let updateQuery = 'UPDATE maintenance_logs SET status = ?';
    const params = [status];

    if (completedDate !== undefined) {
      updateQuery += ', completedDate = ?';
      params.push(completedDate);
    }
    if (technicianNotes !== undefined) {
      updateQuery += ', technicianNotes = ?';
      params.push(technicianNotes);
    }
    if (cost !== undefined) {
      updateQuery += ', cost = ?';
      params.push(cost);
    }

    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(updateQuery, params);

    // If completed, update asset status back to Available or In Use
    if (status === 'Completed') {
      const [mntRows] = await pool.query('SELECT assetId FROM maintenance_logs WHERE id = ?', [req.params.id]);
      if (mntRows.length > 0 && mntRows[0].assetId) {
        await pool.query(`UPDATE assets SET status = 'Available', \`condition\` = 'Good' WHERE id = ?`, [mntRows[0].assetId]);
      }
    }

    const [rows] = await pool.query('SELECT * FROM maintenance_logs WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE maintenance log
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM maintenance_logs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
