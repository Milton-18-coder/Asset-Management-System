import { Router } from 'express';
import { getPool } from '../db.js';
import { normalizePhoneNumber } from '../services/whatsappService.js';

const router = Router();

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

function normalizeRole(role) {
  if (!role) return null;
  const clean = String(role).toLowerCase().replace(/[\s_-]/g, '');
  if (clean === 'superadmin' || clean === 'superadministrator') return 'superadmin';
  if (clean === 'deptadmin' || clean === 'departmentadmin') return 'deptadmin';
  return null;
}

function normalizeDepartment(dept) {
  if (!dept) return null;
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

// GET all users (never expose password)
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, name, role, department, email, phone, created_at FROM users ORDER BY id ASC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single user by ID (never expose password)
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, name, role, department, email, phone, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new user
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const u = req.body;

    if (!u.username || !u.name) {
      return res.status(400).json({ error: 'Username and Name are required' });
    }

    // Role validation
    const normalizedRole = normalizeRole(u.role);
    if (!normalizedRole) {
      return res.status(400).json({ error: "Role must be 'superadmin' or 'deptadmin'" });
    }

    // Department validation
    let dept = null;
    if (normalizedRole === 'deptadmin') {
      dept = normalizeDepartment(u.department);
      if (!dept) {
        return res.status(400).json({
          error: `A valid department is required for deptadmin. Allowed departments: ${ALLOWED_DEPARTMENTS.join(', ')}`
        });
      }
    } else if (normalizedRole === 'superadmin') {
      dept = u.department ? normalizeDepartment(u.department) : null;
    }

    // Phone normalization (WhatsApp-ready digits e.g. 919876543210, no +)
    const normalizedPhone = u.phone ? normalizePhoneNumber(u.phone) : null;

    const userId = u.id || `USR-${Date.now().toString().slice(-4)}`;

    await pool.query(
      `INSERT INTO users (id, username, password, name, role, department, email, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name=VALUES(name), role=VALUES(role), department=VALUES(department), email=VALUES(email), phone=VALUES(phone)`,
      [
        userId,
        u.username,
        u.password || 'password123',
        u.name,
        normalizedRole,
        dept,
        u.email || '',
        normalizedPhone || null
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, username, name, role, department, email, phone, created_at FROM users WHERE id = ? OR username = ?',
      [userId, u.username]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const id = req.params.id;
    const u = req.body;

    // Fetch existing user to verify existence and fallback values
    const [existingRows] = await pool.query(
      'SELECT id, username, name, role, department, email, phone FROM users WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const existing = existingRows[0];

    // Role handling
    let normalizedRole = existing.role;
    if (u.role) {
      normalizedRole = normalizeRole(u.role);
      if (!normalizedRole) {
        return res.status(400).json({ error: "Role must be 'superadmin' or 'deptadmin'" });
      }
    }

    // Department handling
    let dept = existing.department;
    if (normalizedRole === 'superadmin') {
      dept = u.department !== undefined ? (u.department ? normalizeDepartment(u.department) : null) : existing.department;
    } else if (normalizedRole === 'deptadmin') {
      if (u.department !== undefined) {
        dept = normalizeDepartment(u.department);
        if (!dept) {
          return res.status(400).json({
            error: `A valid department is required for deptadmin. Allowed departments: ${ALLOWED_DEPARTMENTS.join(', ')}`
          });
        }
      }
    }

    // Phone normalization
    let normalizedPhone = existing.phone;
    if (u.phone !== undefined) {
      normalizedPhone = u.phone ? normalizePhoneNumber(u.phone) : null;
    }

    const updatedName = u.name !== undefined ? u.name : existing.name;
    const updatedEmail = u.email !== undefined ? u.email : existing.email;

    await pool.query(
      `UPDATE users SET name=?, role=?, department=?, email=?, phone=? WHERE id=?`,
      [updatedName, normalizedRole, dept, updatedEmail, normalizedPhone, id]
    );

    const [rows] = await pool.query(
      'SELECT id, username, name, role, department, email, phone, created_at FROM users WHERE id = ?',
      [id]
    );

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
    res.json({ message: 'User deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
