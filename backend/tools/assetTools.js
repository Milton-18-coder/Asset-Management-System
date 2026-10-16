import { getPool } from '../db.js';

export const assetTools = {
  // 1. Get total asset counts and condition breakdown
  async getAssetCounts() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS totalAssetTypes,
        COALESCE(SUM(quantity), 0) AS totalPhysicalUnits,
        COALESCE(SUM(cost * quantity), 0) AS totalBookValue,
        SUM(CASE WHEN \`condition\` = 'Good' THEN quantity ELSE 0 END) AS goodConditionUnits,
        SUM(CASE WHEN \`condition\` = 'Fair' THEN quantity ELSE 0 END) AS fairConditionUnits,
        SUM(CASE WHEN \`condition\` = 'Poor' THEN quantity ELSE 0 END) AS poorConditionUnits,
        SUM(CASE WHEN \`condition\` = 'Damaged' THEN quantity ELSE 0 END) AS damagedConditionUnits,
        SUM(CASE WHEN status = 'Available' THEN quantity ELSE 0 END) AS availableUnits,
        SUM(CASE WHEN status = 'In Use' THEN quantity ELSE 0 END) AS inUseUnits,
        SUM(CASE WHEN status = 'Needs Inspection' THEN quantity ELSE 0 END) AS needsInspectionUnits,
        SUM(CASE WHEN status = 'Under Maintenance' THEN quantity ELSE 0 END) AS underMaintenanceUnits
      FROM assets
    `);
    return rows[0] || {};
  },

  // 2. Search assets by keyword, category, department, or status
  async searchAssets({ query = '', category = '', department = '', condition = '', limit = 15 } = {}) {
    const pool = getPool();
    let sql = `SELECT id, name, mainCategory, category, department, room, \`condition\`, status, cost, quantity, supplier, purchaseDate FROM assets WHERE 1=1`;
    const params = [];

    if (query) {
      sql += ` AND (name LIKE ? OR id LIKE ? OR description LIKE ? OR supplier LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    }
    if (category && category !== 'All') {
      sql += ` AND (mainCategory = ? OR category = ?)`;
      params.push(category, category);
    }
    if (department && department !== 'All') {
      sql += ` AND department = ?`;
      params.push(department);
    }
    if (condition && condition !== 'All') {
      sql += ` AND \`condition\` = ?`;
      params.push(condition);
    }

    sql += ` ORDER BY cost DESC LIMIT ?`;
    params.push(Math.min(parseInt(limit, 10) || 15, 50));

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // 3. Get asset by specific ID or exact name
  async getAssetById({ id, name } = {}) {
    const pool = getPool();
    if (id) {
      const [rows] = await pool.query(`SELECT * FROM assets WHERE id = ?`, [id]);
      return rows[0] || null;
    }
    if (name) {
      const [rows] = await pool.query(`SELECT * FROM assets WHERE name LIKE ? LIMIT 1`, [`%${name}%`]);
      return rows[0] || null;
    }
    return null;
  },

  // 4. Get assets needing replacement or attention (poor, damaged, or expired)
  async getAssetsNeedingReplacement({ limit = 15 } = {}) {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT id, name, department, room, \`condition\`, status, cost, quantity, supplier, purchaseDate 
      FROM assets 
      WHERE \`condition\` IN ('Poor', 'Damaged') OR status IN ('Needs Inspection', 'Under Maintenance')
      ORDER BY cost DESC
      LIMIT ?
    `, [Math.min(parseInt(limit, 10) || 15, 50)]);
    return rows;
  },

  // 5. Get top high value assets
  async getHighValueAssets({ limit = 10, minCost = 0 } = {}) {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT id, name, mainCategory, category, department, room, cost, quantity, (cost * quantity) AS totalValue, supplier 
      FROM assets 
      WHERE cost >= ?
      ORDER BY totalValue DESC 
      LIMIT ?
    `, [parseFloat(minCost) || 0, Math.min(parseInt(limit, 10) || 10, 30)]);
    return rows;
  }
};
