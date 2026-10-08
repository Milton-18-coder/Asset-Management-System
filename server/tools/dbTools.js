import { getPool } from '../db.js';

export const dbTools = {
  /**
   * Execute a safe read-only SQL query against the MySQL database.
   */
  async executeSafeQuery(sqlQuery) {
    if (!sqlQuery || typeof sqlQuery !== 'string') {
      throw new Error('SQL query must be a non-empty string.');
    }

    const trimmed = sqlQuery.trim();
    const upper = trimmed.toUpperCase();

    // Safety guard: only allow SELECT or SHOW queries
    if (!upper.startsWith('SELECT') && !upper.startsWith('SHOW') && !upper.startsWith('DESCRIBE')) {
      throw new Error('Security Restriction: Only read-only SELECT/SHOW queries are permitted.');
    }

    // Block dangerous DDL/DML keywords
    const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'RENAME', 'GRANT', 'REVOKE'];
    for (const word of forbidden) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(trimmed)) {
        throw new Error(`Security Restriction: Forbidden keyword '${word}' detected in query.`);
      }
    }

    // Enforce reasonable limit if none present
    let finalQuery = trimmed
      .replace(/(?<![`\w])condition(?![`\w])/gi, '`condition`')
      .replace(/(?<![`\w])read(?![`\w])/gi, '`read`');

    if (!upper.includes('LIMIT') && !upper.includes('COUNT(')) {
      finalQuery += ' LIMIT 50';
    }

    const pool = getPool();
    const [rows] = await pool.query(finalQuery);
    return {
      rowCount: Array.isArray(rows) ? rows.length : 1,
      results: rows
    };
  },

  /**
   * Get all table names and sample counts from database
   */
  async getDatabaseOverview() {
    const pool = getPool();
    const tables = [
      'assets', 'departments', 'buildings', 'rooms', 'users', 
      'vendors', 'purchase_history', 'maintenance_logs', 'inspections', 
      'transfers', 'disposals', 'notifications', 'audit_logs', 'categories'
    ];
    
    const counts = {};
    for (const t of tables) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM \`${t}\``);
        counts[t] = rows[0]?.count || 0;
      } catch (e) {
        counts[t] = 'N/A';
      }
    }
    return counts;
  }
};
