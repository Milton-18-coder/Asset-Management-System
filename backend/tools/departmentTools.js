import { getPool } from '../db.js';

export const departmentTools = {
  // 1. Departmental asset volume and capital investment summary
  async getDepartmentStats() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        d.name AS departmentName,
        d.code AS departmentCode,
        d.building,
        d.hod,
        COALESCE(SUM(a.quantity), 0) AS totalAssetUnits,
        COALESCE(SUM(a.cost * a.quantity), 0) AS totalInvestedCapital,
        COUNT(DISTINCT a.id) AS uniqueAssetTypes,
        SUM(CASE WHEN a.\`condition\` = 'Good' THEN a.quantity ELSE 0 END) AS goodConditionUnits,
        SUM(CASE WHEN a.\`condition\` IN ('Poor', 'Damaged') THEN a.quantity ELSE 0 END) AS damagedUnits
      FROM departments d
      LEFT JOIN assets a ON a.department = d.name
      GROUP BY d.id, d.name, d.code, d.building, d.hod
      ORDER BY totalAssetUnits DESC
    `);
    return rows;
  },

  // 2. Department with highest volume or value
  async getTopDepartment() {
    const stats = await this.getDepartmentStats();
    if (stats.length === 0) return null;
    return {
      topByVolume: [...stats].sort((a, b) => b.totalAssetUnits - a.totalAssetUnits)[0],
      topByCapital: [...stats].sort((a, b) => b.totalInvestedCapital - a.totalInvestedCapital)[0],
      allDepartments: stats
    };
  }
};
