import { Router } from 'express';
import { getPool } from '../db.js';
import { notifyAssetStatusChange } from '../services/assetNotificationService.js';

const router = Router();

// GET all assets
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM assets ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single asset by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const ALLOWED_DEPARTMENTS = [
  'Computer Science',
  'Mechanical',
  'Civil',
  'IT',
  'AIDS',
  'ECE',
  'EEE',
  'Science & Humanities',
  'Admin Block'
];

function normalizeDepartment(dept) {
  if (!dept) return 'Admin Block';
  const clean = dept.trim();
  if (ALLOWED_DEPARTMENTS.includes(clean)) return clean;
  const lower = clean.toLowerCase();
  if (lower === 'cse' || lower.includes('computer')) return 'Computer Science';
  if (lower === 'me' || lower.includes('mech')) return 'Mechanical';
  if (lower === 'ce' || lower.includes('civil')) return 'Civil';
  if (lower === 'it' || lower.includes('information')) return 'IT';
  if (lower === 'aids' || lower.includes('ai') || lower.includes('data science')) return 'AIDS';
  if (lower === 'ece' || lower.includes('electronics') || lower.includes('communication')) return 'ECE';
  if (lower === 'eee' || lower.includes('electrical')) return 'EEE';
  if (lower === 's&h' || lower.includes('science') || lower.includes('physics') || lower.includes('chem') || lower.includes('math')) return 'Science & Humanities';
  if (lower.includes('admin') || lower.includes('office') || lower.includes('library')) return 'Admin Block';
  return null;
}

// POST add new asset
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const a = req.body;
    const validatedDept = normalizeDepartment(a.department);
    if (!validatedDept) {
      return res.status(400).json({ error: `Invalid department. Department must be one of: ${ALLOWED_DEPARTMENTS.join(', ')}` });
    }
    a.department = validatedDept;
    await pool.query(
      `INSERT INTO assets (id, name, mainCategory, category, itemType, building, department, room, assignedTo, assignedRole, assignedEmail, \`condition\`, status, purchaseDate, cost, supplier, warranty, quantity, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name=VALUES(name), mainCategory=VALUES(mainCategory), category=VALUES(category), itemType=VALUES(itemType),
         building=VALUES(building), department=VALUES(department), room=VALUES(room), assignedTo=VALUES(assignedTo),
         assignedRole=VALUES(assignedRole), assignedEmail=VALUES(assignedEmail), \`condition\`=VALUES(\`condition\`),
         status=VALUES(status), purchaseDate=VALUES(purchaseDate), cost=VALUES(cost), supplier=VALUES(supplier),
         warranty=VALUES(warranty), quantity=VALUES(quantity), description=VALUES(description)`,
      [
        a.id, a.name, a.mainCategory || 'Furniture', a.category || 'General', a.itemType || '',
        a.building || '', a.department, a.room || '', a.assignedTo || '',
        a.assignedRole || '', a.assignedEmail || '', a.condition || 'Good',
        a.status || 'Available', a.purchaseDate || null, a.cost || 0,
        a.supplier || '', a.warranty || '', a.quantity || 1, a.description || ''
      ]
    );
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [a.id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update asset
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const id = req.params.id;
    const a = req.body;
    const updatedBy = req.body.updatedBy || null;

    // Fetch existing asset state before update
    const [prevRows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (prevRows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    const prevAsset = prevRows[0];

    // Authorization check: If updatedBy is Dept Admin, verify department match
    if (updatedBy) {
      const editorRole = String(updatedBy.role || '').toLowerCase().replace(/[\s_-]/g, '');
      if (editorRole === 'deptadmin') {
        const editorDept = normalizeDepartment(updatedBy.department);
        const assetDept = normalizeDepartment(prevAsset.department);
        if (editorDept && assetDept && editorDept !== assetDept) {
          return res.status(403).json({
            error: `Forbidden: Department Admin (${editorDept}) is not authorized to modify assets belonging to ${assetDept}.`
          });
        }
      }
    }

    if (a.department) {
      const validatedDept = normalizeDepartment(a.department);
      if (!validatedDept) {
        return res.status(400).json({ error: `Invalid department. Department must be one of: ${ALLOWED_DEPARTMENTS.join(', ')}` });
      }
      a.department = validatedDept;
    }

    await pool.query(
      `UPDATE assets SET
         name=?, mainCategory=?, category=?, itemType=?, building=?, department=?, room=?,
         assignedTo=?, assignedRole=?, assignedEmail=?, \`condition\`=?, status=?,
         purchaseDate=?, cost=?, supplier=?, warranty=?, quantity=?, description=?
       WHERE id=?`,
      [
        a.name !== undefined ? a.name : prevAsset.name,
        a.mainCategory || prevAsset.mainCategory || 'Furniture',
        a.category || prevAsset.category || 'General',
        a.itemType || prevAsset.itemType || '',
        a.building || prevAsset.building || '',
        a.department || prevAsset.department || '',
        a.room || prevAsset.room || '',
        a.assignedTo !== undefined ? a.assignedTo : prevAsset.assignedTo,
        a.assignedRole !== undefined ? a.assignedRole : prevAsset.assignedRole,
        a.assignedEmail !== undefined ? a.assignedEmail : prevAsset.assignedEmail,
        a.condition || prevAsset.condition || 'Good',
        a.status || prevAsset.status || 'Available',
        a.purchaseDate !== undefined ? a.purchaseDate : prevAsset.purchaseDate,
        a.cost !== undefined ? a.cost : prevAsset.cost,
        a.supplier !== undefined ? a.supplier : prevAsset.supplier,
        a.warranty !== undefined ? a.warranty : prevAsset.warranty,
        a.quantity !== undefined ? a.quantity : prevAsset.quantity,
        a.description !== undefined ? a.description : prevAsset.description,
        id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    const updatedAsset = rows[0];

    // Trigger two-way automated notification if condition or status changed
    let notificationResult = null;
    if ((a.condition && a.condition !== prevAsset.condition) || (a.status && a.status !== prevAsset.status)) {
      try {
        notificationResult = await notifyAssetStatusChange({
          asset: updatedAsset,
          previousAsset: prevAsset,
          updatedBy
        });
      } catch (err) {
        console.error('[Asset PUT] Notification dispatch error:', err.message);
      }
    }

    res.json({
      ...updatedAsset,
      ...(notificationResult ? { notification: notificationResult } : {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE asset
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM assets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Asset deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH location
router.patch('/:id/location', async (req, res) => {
  try {
    const pool = getPool();
    const { room, building, department } = req.body;
    await pool.query(
      'UPDATE assets SET room = COALESCE(?, room), building = COALESCE(?, building), department = COALESCE(?, department) WHERE id = ?',
      [room, building, department, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH custodian
router.patch('/:id/custodian', async (req, res) => {
  try {
    const pool = getPool();
    const { assignedTo, assignedRole, assignedEmail } = req.body;
    await pool.query(
      'UPDATE assets SET assignedTo = COALESCE(?, assignedTo), assignedRole = COALESCE(?, assignedRole), assignedEmail = COALESCE(?, assignedEmail) WHERE id = ?',
      [assignedTo, assignedRole, assignedEmail, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH condition
router.patch('/:id/condition', async (req, res) => {
  try {
    const pool = getPool();
    const { condition, updatedBy } = req.body;

    const [prevRows] = await pool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (prevRows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    const prevAsset = prevRows[0];

    // Authorization check: If updatedBy is Dept Admin, verify department match
    if (updatedBy) {
      const editorRole = String(updatedBy.role || '').toLowerCase().replace(/[\s_-]/g, '');
      if (editorRole === 'deptadmin') {
        const editorDept = normalizeDepartment(updatedBy.department);
        const assetDept = normalizeDepartment(prevAsset.department);
        if (editorDept && assetDept && editorDept !== assetDept) {
          return res.status(403).json({
            error: `Forbidden: Department Admin (${editorDept}) is not authorized to modify assets belonging to ${assetDept}.`
          });
        }
      }
    }

    await pool.query('UPDATE assets SET `condition` = ? WHERE id = ?', [condition, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    const updatedAsset = rows[0];

    // Trigger two-way automated notification if condition changed
    let notificationResult = null;
    if (condition && condition !== prevAsset.condition) {
      try {
        notificationResult = await notifyAssetStatusChange({
          asset: updatedAsset,
          previousAsset: prevAsset,
          updatedBy
        });
      } catch (err) {
        console.error('[Asset PATCH condition] Notification dispatch error:', err.message);
      }
    }

    res.json({
      ...updatedAsset,
      ...(notificationResult ? { notification: notificationResult } : {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST bulk assign custodians
router.post('/bulk-assign', async (req, res) => {
  try {
    const pool = getPool();
    const { assetIds, assignedTo, assignedRole, assignedEmail } = req.body;
    if (!assetIds || assetIds.length === 0) {
      return res.status(400).json({ error: 'assetIds required' });
    }
    for (const id of assetIds) {
      await pool.query(
        'UPDATE assets SET assignedTo = COALESCE(?, assignedTo), assignedRole = COALESCE(?, assignedRole), assignedEmail = COALESCE(?, assignedEmail) WHERE id = ?',
        [assignedTo, assignedRole, assignedEmail, id]
      );
    }
    const [rows] = await pool.query('SELECT * FROM assets');
    res.json({ message: 'Bulk assign updated', assets: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
