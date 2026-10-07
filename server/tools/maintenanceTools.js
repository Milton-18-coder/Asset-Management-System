import { getPool } from '../db.js';

export const maintenanceTools = {
  // 1. Get active maintenance status and pending work orders
  async getMaintenanceSummary() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS totalMaintenanceLogs,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) AS scheduledCount,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressCount,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedCount,
        COALESCE(SUM(cost), 0) AS totalMaintenanceExpense
      FROM maintenance_logs
    `);
    const [recentLogs] = await pool.query(`
      SELECT id, assetId, furniture, issueDescription, status, scheduledDate, cost, vendor
      FROM maintenance_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);
    return {
      summary: rows[0] || {},
      recentLogs
    };
  }
};
