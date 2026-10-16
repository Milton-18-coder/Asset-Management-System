import { getPool } from '../db.js';

export const inspectionTools = {
  // 1. Get recent inspections summary and condition breakdown
  async getInspectionSummary() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS totalInspections,
        SUM(CASE WHEN \`condition\` = 'Good' THEN 1 ELSE 0 END) AS goodCount,
        SUM(CASE WHEN \`condition\` = 'Fair' THEN 1 ELSE 0 END) AS fairCount,
        SUM(CASE WHEN \`condition\` = 'Poor' THEN 1 ELSE 0 END) AS poorCount,
        SUM(CASE WHEN \`condition\` = 'Damaged' THEN 1 ELSE 0 END) AS damagedCount
      FROM inspections
    `);
    const [recent] = await pool.query(`
      SELECT id, assetId, furniture, location, \`condition\`, inspector, date, notes
      FROM inspections
      ORDER BY date DESC
      LIMIT 10
    `);
    return {
      summary: rows[0] || {},
      recent
    };
  }
};
