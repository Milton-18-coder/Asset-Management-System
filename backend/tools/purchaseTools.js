import { getPool } from '../db.js';

export const purchaseTools = {
  // 1. Overall procurement statistics & summary
  async getPurchaseStats({ year, from, to } = {}) {
    const pool = getPool();
    let sql = `
      SELECT 
        COALESCE(SUM(totalAmount), 0) AS totalProcurementSpend,
        COALESCE(SUM(quantity), 0) AS totalUnitsPurchased,
        COUNT(*) AS totalTransactions,
        COUNT(DISTINCT vendorName) AS activeSuppliersCount,
        COUNT(DISTINCT assetId) AS uniqueAssetsCount,
        COALESCE(AVG(purchasePrice), 0) AS averageUnitPrice,
        COALESCE(MIN(purchasePrice), 0) AS minUnitPrice,
        COALESCE(MAX(purchasePrice), 0) AS maxUnitPrice
      FROM purchase_history
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      sql += ` AND YEAR(purchaseDate) = ?`;
      params.push(year);
    }
    if (from) {
      sql += ` AND purchaseDate >= ?`;
      params.push(from);
    }
    if (to) {
      sql += ` AND purchaseDate <= ?`;
      params.push(to);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0] || {};
  },

  // 2. Search purchase transactions
  async searchPurchases({ query = '', minAmount = 0, category = '', vendor = '', year, limit = 15 } = {}) {
    const pool = getPool();
    let sql = `SELECT id, assetName, vendorName, categoryName, subcategoryName, purchaseDate, purchasePrice, quantity, totalAmount, invoiceNumber FROM purchase_history WHERE 1=1`;
    const params = [];

    if (query) {
      sql += ` AND (assetName LIKE ? OR vendorName LIKE ? OR invoiceNumber LIKE ? OR notes LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    }
    if (minAmount > 0) {
      sql += ` AND totalAmount >= ?`;
      params.push(parseFloat(minAmount));
    }
    if (category && category !== 'All') {
      sql += ` AND (categoryName = ? OR subcategoryName = ?)`;
      params.push(category, category);
    }
    if (vendor && vendor !== 'All') {
      sql += ` AND (vendorName = ? OR vendorId = ?)`;
      params.push(vendor, vendor);
    }
    if (year) {
      sql += ` AND YEAR(purchaseDate) = ?`;
      params.push(year);
    }

    sql += ` ORDER BY purchaseDate DESC, totalAmount DESC LIMIT ?`;
    params.push(Math.min(parseInt(limit, 10) || 15, 50));

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // 3. Category wise procurement breakdown
  async getCategoryPurchases() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        categoryName,
        COALESCE(SUM(totalAmount), 0) AS totalSpend,
        COALESCE(SUM(quantity), 0) AS unitsPurchased,
        COUNT(*) AS transactionCount,
        COALESCE(AVG(purchasePrice), 0) AS avgPrice
      FROM purchase_history
      GROUP BY categoryName
      ORDER BY totalSpend DESC
    `);
    return rows;
  },

  // 4. Monthly spend trends
  async getMonthlySpendTrend({ limit = 12 } = {}) {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(purchaseDate, '%Y-%m') AS monthKey,
        DATE_FORMAT(purchaseDate, '%b %Y') AS monthLabel,
        COALESCE(SUM(totalAmount), 0) AS totalSpent,
        COALESCE(SUM(quantity), 0) AS units,
        COUNT(*) AS transactions
      FROM purchase_history
      GROUP BY monthKey, monthLabel
      ORDER BY monthKey DESC
      LIMIT ?
    `, [Math.min(parseInt(limit, 10) || 12, 36)]);
    return rows.reverse();
  }
};
