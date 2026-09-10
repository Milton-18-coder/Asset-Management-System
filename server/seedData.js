import { getPool } from './db.js';

export async function seedInitialDataIfEmpty(
  initialAssets,
  initialUsers,
  initialTransfers,
  initialInspections,
  initialNotifications,
  initialDepartments,
  initialBuildings,
  initialRooms,
  initialMaintenanceLogs,
  initialDisposals,
  initialVendors,
  initialAuditLogs,
  initialCategories
) {
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

    // 6. Check & Seed Departments
    const [deptRows] = await pool.query('SELECT COUNT(*) as count FROM departments');
    if (deptRows[0].count === 0 && initialDepartments && initialDepartments.length > 0) {
      console.log(`🌱 Seeding ${initialDepartments.length} departments into MySQL...`);
      for (const d of initialDepartments) {
        await pool.query(
          `INSERT INTO departments (id, name, code, building, hod, admin)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [d.id, d.name, d.code, d.building || '', d.hod || '', d.admin || '']
        );
      }
      console.log('✅ Departments seeded successfully.');
    }

    // 7. Check & Seed Buildings
    const [bldgRows] = await pool.query('SELECT COUNT(*) as count FROM buildings');
    if (bldgRows[0].count === 0 && initialBuildings && initialBuildings.length > 0) {
      console.log(`🌱 Seeding ${initialBuildings.length} buildings into MySQL...`);
      for (const b of initialBuildings) {
        await pool.query(
          `INSERT INTO buildings (id, name, code, floors)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [b.id, b.name, b.code, b.floors || 1]
        );
      }
      console.log('✅ Buildings seeded successfully.');
    }

    // 8. Check & Seed Rooms
    const [roomRows] = await pool.query('SELECT COUNT(*) as count FROM rooms');
    if (roomRows[0].count === 0 && initialRooms && initialRooms.length > 0) {
      console.log(`🌱 Seeding ${initialRooms.length} rooms into MySQL...`);
      for (const r of initialRooms) {
        await pool.query(
          `INSERT INTO rooms (id, number, building, department, floor, type, capacity)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE number=VALUES(number)`,
          [r.id, r.number, r.building || '', r.department || '', r.floor || 1, r.type || 'Classroom', r.capacity || 30]
        );
      }
      console.log('✅ Rooms seeded successfully.');
    }

    // 9. Check & Seed Maintenance Logs
    const [mntRows] = await pool.query('SELECT COUNT(*) as count FROM maintenance_logs');
    if (mntRows[0].count === 0 && initialMaintenanceLogs && initialMaintenanceLogs.length > 0) {
      console.log(`🌱 Seeding ${initialMaintenanceLogs.length} maintenance logs into MySQL...`);
      for (const m of initialMaintenanceLogs) {
        await pool.query(
          `INSERT INTO maintenance_logs (id, assetId, furniture, issueDescription, scheduledDate, completedDate, cost, status, vendor, technicianNotes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status)`,
          [m.id, m.assetId, m.furniture, m.issueDescription, m.scheduledDate || null, m.completedDate || null, m.cost || 0, m.status || 'Scheduled', m.vendor || '', m.technicianNotes || '']
        );
      }
      console.log('✅ Maintenance logs seeded successfully.');
    }

    // 10. Check & Seed Disposals
    const [dspRows] = await pool.query('SELECT COUNT(*) as count FROM disposals');
    if (dspRows[0].count === 0 && initialDisposals && initialDisposals.length > 0) {
      console.log(`🌱 Seeding ${initialDisposals.length} disposals into MySQL...`);
      for (const dp of initialDisposals) {
        await pool.query(
          `INSERT INTO disposals (id, assetId, furniture, disposalDate, reason, resaleValue, approvedBy, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE reason=VALUES(reason)`,
          [dp.id, dp.assetId, dp.furniture, dp.disposalDate, dp.reason, dp.resaleValue || 0, dp.approvedBy || '', dp.notes || '']
        );
      }
      console.log('✅ Disposals seeded successfully.');
    }

    // 11. Check & Seed Vendors
    const [vndRows] = await pool.query('SELECT COUNT(*) as count FROM vendors');
    if (vndRows[0].count === 0 && initialVendors && initialVendors.length > 0) {
      console.log(`🌱 Seeding ${initialVendors.length} vendors into MySQL...`);
      for (const v of initialVendors) {
        await pool.query(
          `INSERT INTO vendors (id, name, contactPerson, email, phone, address, gstin, rating, services)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [v.id, v.name, v.contactPerson || '', v.email || '', v.phone || '', v.address || '', v.gstin || '', v.rating || 4.5, v.services || '']
        );
      }
      console.log('✅ Vendors seeded successfully.');
    }

    // 12. Check & Seed Audit Logs
    const [audRows] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');
    if (audRows[0].count === 0 && initialAuditLogs && initialAuditLogs.length > 0) {
      console.log(`🌱 Seeding ${initialAuditLogs.length} audit logs into MySQL...`);
      for (const au of initialAuditLogs) {
        await pool.query(
          `INSERT INTO audit_logs (id, userId, userName, userRole, action, entity, entityId, details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE action=VALUES(action)`,
          [au.id, au.userId || null, au.userName || '', au.userRole || '', au.action, au.entity, au.entityId || '', au.details || '']
        );
      }
      console.log('✅ Audit logs seeded successfully.');
    }

    // 13. Check & Seed Categories
    const [catRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (catRows[0].count === 0 && initialCategories && initialCategories.length > 0) {
      console.log(`🌱 Seeding ${initialCategories.length} categories into MySQL...`);
      for (const c of initialCategories) {
        await pool.query(
          `INSERT INTO categories (id, name, mainCategory, code, icon, depreciationRate, usefulLifeYears, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [c.id, c.name, c.mainCategory, c.code, c.icon || 'Box', c.depreciationRate || 10.0, c.usefulLifeYears || 5, c.description || '']
        );
      }
      console.log('✅ Categories seeded successfully.');
    }
  } catch (err) {
    console.error('⚠️ Seeding error:', err.message);
  }
}
