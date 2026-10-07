import { getPool } from '../db.js';

export const vendorTools = {
  // 1. Top vendors ranked by total procurement value
  async getTopVendors({ limit = 10 } = {}) {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        vendorName,
        vendorId,
        COALESCE(SUM(totalAmount), 0) AS totalProcurementValue,
        COALESCE(SUM(quantity), 0) AS totalUnitsSupplied,
        COUNT(*) AS transactionCount,
        MIN(purchaseDate) AS firstPurchaseDate,
        MAX(purchaseDate) AS latestPurchaseDate
      FROM purchase_history
      GROUP BY vendorName, vendorId
      ORDER BY totalProcurementValue DESC
      LIMIT ?
    `, [Math.min(parseInt(limit, 10) || 10, 30)]);
    return rows;
  },

  // 2. Search vendors and their portfolio
  async searchVendors({ query = '', limit = 10 } = {}) {
    const pool = getPool();
    let sql = `SELECT * FROM vendors WHERE 1=1`;
    const params = [];

    if (query) {
      sql += ` AND (name LIKE ? OR services LIKE ? OR contactPerson LIKE ? OR email LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ` LIMIT ?`;
    params.push(Math.min(parseInt(limit, 10) || 10, 30));

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // 3. Get single vendor statistics & history
  async getVendorDetails({ name, id } = {}) {
    const pool = getPool();
    const [vendorRows] = await pool.query(
      `SELECT * FROM vendors WHERE id = ? OR name = ? LIMIT 1`,
      [id || '', name || '']
    );

    const [stats] = await pool.query(`
      SELECT 
        COALESCE(SUM(totalAmount), 0) AS totalSpent,
        COALESCE(SUM(quantity), 0) AS totalUnits,
        COUNT(*) AS transactionsCount,
        MIN(purchaseDate) AS firstPurchase,
        MAX(purchaseDate) AS latestPurchase
      FROM purchase_history 
      WHERE vendorName = ? OR vendorId = ?
    `, [name || vendorRows[0]?.name || '', id || vendorRows[0]?.id || '']);

    return {
      vendor: vendorRows[0] || { name: name || id },
      stats: stats[0] || {}
    };
  }
};
