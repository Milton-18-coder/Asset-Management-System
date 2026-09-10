import { getPool } from './db.js';

export async function seedInitialDataIfEmpty(initialAssets, initialUsers, initialTransfers, initialInspections, initialNotifications) {
  const pool = getPool();

  try {
    // 1. Check & Seed Assets
    const [assetRows] = await pool.query('SELECT COUNT(*) as count FROM assets');
    if (assetRows[0].count === 0 && initialAssets && initialAssets.length > 0) {
      console.log(`🌱 Seeding ${initialAssets.length} assets into MySQL...`);
      for (const a of initialAssets) {
        await pool.query(
          `INSERT INTO assets (id, name, mainCategory, category, itemType, building, department, room, assignedTo, assignedRole, assignedEmail, \`condition\`, status, purchaseDate, cost, supplier, warranty, quantity, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [
            a.id,
            a.name,
            a.mainCategory || 'Furniture',
            a.category || 'General',
            a.itemType || '',
            a.building || '',
            a.department || '',
            a.room || '',
            a.assignedTo || '',
            a.assignedRole || '',
            a.assignedEmail || '',
            a.condition || 'Good',
            a.status || 'Available',
            a.purchaseDate || null,
            a.cost || 0,
            a.supplier || '',
            a.warranty || '',
            a.quantity || 1,
            a.description || '',
          ]
        );
      }
      console.log('✅ Assets seeded successfully.');
    }

    // 2. Check & Seed Users
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0 && initialUsers && initialUsers.length > 0) {
      console.log(`🌱 Seeding ${initialUsers.length} users into MySQL...`);
      for (const u of initialUsers) {
        await pool.query(
          `INSERT INTO users (id, username, password, name, role, department, email)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [u.id, u.username, u.password, u.name, u.role, u.department || null, u.email || '']
        );
      }
      console.log('✅ Users seeded successfully.');
    }

    // 3. Check & Seed Transfers
    const [transferRows] = await pool.query('SELECT COUNT(*) as count FROM transfers');
    if (transferRows[0].count === 0 && initialTransfers && initialTransfers.length > 0) {
      console.log(`🌱 Seeding ${initialTransfers.length} transfers into MySQL...`);
      for (const t of initialTransfers) {
        await pool.query(
          `INSERT INTO transfers (id, assetId, furniture, source, destination, requestedBy, role, department, date, status, reason)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status)`,
          [t.id, t.assetId, t.furniture, t.source, t.destination, t.requestedBy, t.role, t.department, t.date || null, t.status || 'Pending', t.reason || '']
        );
      }
      console.log('✅ Transfers seeded successfully.');
    }

    // 4. Check & Seed Inspections
    const [inspectionRows] = await pool.query('SELECT COUNT(*) as count FROM inspections');
    if (inspectionRows[0].count === 0 && initialInspections && initialInspections.length > 0) {
      console.log(`🌱 Seeding ${initialInspections.length} inspections into MySQL...`);
      for (const i of initialInspections) {
        await pool.query(
          `INSERT INTO inspections (id, assetId, furniture, location, \`condition\`, inspector, date, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE \`condition\`=VALUES(\`condition\`)`,
          [i.id, i.assetId, i.furniture, i.location, i.condition, i.inspector, i.date || null, i.notes || '']
        );
      }
      console.log('✅ Inspections seeded successfully.');
    }

    // 5. Check & Seed Notifications
    const [notifRows] = await pool.query('SELECT COUNT(*) as count FROM notifications');
    if (notifRows[0].count === 0 && initialNotifications && initialNotifications.length > 0) {
      console.log(`🌱 Seeding ${initialNotifications.length} notifications into MySQL...`);
      for (const n of initialNotifications) {
        await pool.query(
          `INSERT INTO notifications (id, title, message, time, \`read\`, department, type, link)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE \`read\`=VALUES(\`read\`)`,
          [n.id, n.title, n.message, n.time, n.read ? 1 : 0, n.department || null, n.type || 'info', n.link || '']
        );
      }
      console.log('✅ Notifications seeded successfully.');
    }
  } catch (err) {
    console.error('⚠️ Seeding error:', err.message);
  }
}
