import { Router } from 'express';
import { getPool } from '../db.js';
import { notifyAssetStatusChange } from '../services/assetNotificationService.js';

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
    const updatedBy = req.body.updatedBy || {
      name: i.inspector,
      role: req.body.role || 'deptadmin',
      email: req.body.email,
    };

    // Check existing asset
    const [assetRows] = await pool.query('SELECT * FROM assets WHERE id = ?', [i.assetId]);
    const prevAsset = assetRows.length > 0 ? assetRows[0] : null;

    await pool.query(
      `INSERT INTO inspections (id, assetId, furniture, location, \`condition\`, inspector, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`condition\`=VALUES(\`condition\`), notes=VALUES(notes)`,
      [i.id, i.assetId, i.furniture, i.location, i.condition, i.inspector, i.date || null, i.notes || '']
    );

    // Sync condition to assets table if asset exists
    let notificationResult = null;
    if (prevAsset) {
      await pool.query('UPDATE assets SET `condition` = ? WHERE id = ?', [i.condition, i.assetId]);
      
      // If condition changed, trigger two-way automated notification
      if (i.condition && i.condition !== prevAsset.condition) {
        try {
          notificationResult = await notifyAssetStatusChange({
            asset: { ...prevAsset, condition: i.condition },
            previousAsset: prevAsset,
            updatedBy
          });
        } catch (err) {
          console.error('[Inspections POST] Notification dispatch error:', err.message);
        }
      }
    }

    const [rows] = await pool.query('SELECT * FROM inspections WHERE id = ?', [i.id]);
    res.status(201).json({
      ...rows[0],
      ...(notificationResult ? { notification: notificationResult } : {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

