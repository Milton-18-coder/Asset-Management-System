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
    // 1. Assets
    if (initialAssets && initialAssets.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialAssets.length} assets into MySQL...`);
      for (const a of initialAssets) {
        await pool.query(
          `INSERT INTO assets (id, name, mainCategory, category, itemType, building, department, room, assignedTo, assignedRole, assignedEmail, \`condition\`, status, purchaseDate, cost, supplier, warranty, quantity, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name),
             mainCategory=VALUES(mainCategory),
             category=VALUES(category),
             itemType=VALUES(itemType),
             building=VALUES(building),
             department=VALUES(department),
             room=VALUES(room),
             assignedTo=VALUES(assignedTo),
             assignedRole=VALUES(assignedRole),
             assignedEmail=VALUES(assignedEmail),
             \`condition\`=VALUES(\`condition\`),
             status=VALUES(status),
             purchaseDate=VALUES(purchaseDate),
             cost=VALUES(cost),
             supplier=VALUES(supplier),
             warranty=VALUES(warranty),
             quantity=VALUES(quantity),
             description=VALUES(description)`,
          [
            a.id,
            a.name,
            a.mainCategory || 'Furniture',
            a.category || 'General',
            a.itemType || 'General',
            a.building || 'Engineering Block',
            a.department || 'Administration',
            a.room || 'ADM-101',
            a.assignedTo || 'Unassigned',
            a.assignedRole || 'Staff',
            a.assignedEmail || 'admin@nec.edu.in',
            a.condition || 'Good',
            a.status || 'Available',
            a.purchaseDate || null,
            a.cost || 0,
            a.supplier || 'Campus Procurement',
            a.warranty || '1 Year Standard',
            a.quantity || 1,
            a.description || '',
          ]
        );
      }
      console.log('✅ Assets synced.');
    }

    // 2. Users
    if (initialUsers && initialUsers.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialUsers.length} users into MySQL...`);
      for (const u of initialUsers) {
        await pool.query(
          `INSERT INTO users (id, username, password, name, role, department, email)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             username=VALUES(username),
             password=VALUES(password),
             name=VALUES(name),
             role=VALUES(role),
             department=VALUES(department),
             email=VALUES(email)`,
          [u.id, u.username, u.password, u.name, u.role, u.department || null, u.email || '']
        );
      }
      console.log('✅ Users synced.');
    }

    // 3. Transfers
    if (initialTransfers && initialTransfers.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialTransfers.length} transfers into MySQL...`);
      for (const t of initialTransfers) {
        await pool.query(
          `INSERT INTO transfers (id, assetId, furniture, source, destination, requestedBy, role, department, date, status, reason)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             assetId=VALUES(assetId),
             furniture=VALUES(furniture),
             source=VALUES(source),
             destination=VALUES(destination),
             requestedBy=VALUES(requestedBy),
             role=VALUES(role),
             department=VALUES(department),
             date=VALUES(date),
             status=VALUES(status),
             reason=VALUES(reason)`,
          [t.id, t.assetId, t.furniture, t.source, t.destination, t.requestedBy, t.role, t.department, t.date || null, t.status || 'Pending', t.reason || '']
        );
      }
      console.log('✅ Transfers synced.');
    }

    // 4. Inspections
    if (initialInspections && initialInspections.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialInspections.length} inspections into MySQL...`);
      for (const i of initialInspections) {
        await pool.query(
          `INSERT INTO inspections (id, assetId, furniture, location, \`condition\`, inspector, date, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             assetId=VALUES(assetId),
             furniture=VALUES(furniture),
             location=VALUES(location),
             \`condition\`=VALUES(\`condition\`),
             inspector=VALUES(inspector),
             date=VALUES(date),
             notes=VALUES(notes)`,
          [i.id, i.assetId, i.furniture, i.location, i.condition, i.inspector, i.date || null, i.notes || '']
        );
      }
      console.log('✅ Inspections synced.');
    }

    // 5. Notifications
    if (initialNotifications && initialNotifications.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialNotifications.length} notifications into MySQL...`);
      for (const n of initialNotifications) {
        await pool.query(
          `INSERT INTO notifications (id, title, message, time, \`read\`, department, type, link)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title=VALUES(title),
             message=VALUES(message),
             time=VALUES(time),
             \`read\`=VALUES(\`read\`),
             department=VALUES(department),
             type=VALUES(type),
             link=VALUES(link)`,
          [n.id, n.title, n.message, n.time, n.read ? 1 : 0, n.department || null, n.type || 'info', n.link || '']
        );
      }
      console.log('✅ Notifications synced.');
    }

    // 6. Departments
    if (initialDepartments && initialDepartments.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialDepartments.length} departments into MySQL...`);
      for (const d of initialDepartments) {
        await pool.query(
          `INSERT INTO departments (id, name, code, building, hod, admin)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name),
             code=VALUES(code),
             building=VALUES(building),
             hod=VALUES(hod),
             admin=VALUES(admin)`,
          [d.id, d.name, d.code, d.building || '', d.hod || '', d.admin || '']
        );
      }
      console.log('✅ Departments synced.');
    }

    // 7. Buildings
    if (initialBuildings && initialBuildings.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialBuildings.length} buildings into MySQL...`);
      for (const b of initialBuildings) {
        await pool.query(
          `INSERT INTO buildings (id, name, code, floors)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name),
             code=VALUES(code),
             floors=VALUES(floors)`,
          [b.id, b.name, b.code, b.floors || 1]
        );
      }
      console.log('✅ Buildings synced.');
    }

    // 8. Rooms
    if (initialRooms && initialRooms.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialRooms.length} rooms into MySQL...`);
      for (const r of initialRooms) {
        await pool.query(
          `INSERT INTO rooms (id, number, building, department, floor, type, capacity)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             number=VALUES(number),
             building=VALUES(building),
             department=VALUES(department),
             floor=VALUES(floor),
             type=VALUES(type),
             capacity=VALUES(capacity)`,
          [r.id, r.number, r.building || '', r.department || '', r.floor || 1, r.type || 'Classroom', r.capacity || 30]
        );
      }
      console.log('✅ Rooms synced.');
    }

    // 9. Maintenance Logs
    if (initialMaintenanceLogs && initialMaintenanceLogs.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialMaintenanceLogs.length} maintenance logs into MySQL...`);
      for (const m of initialMaintenanceLogs) {
        await pool.query(
          `INSERT INTO maintenance_logs (id, assetId, furniture, issueDescription, scheduledDate, completedDate, cost, status, vendor, technicianNotes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             assetId=VALUES(assetId),
             furniture=VALUES(furniture),
             issueDescription=VALUES(issueDescription),
             scheduledDate=VALUES(scheduledDate),
             completedDate=VALUES(completedDate),
             cost=VALUES(cost),
             status=VALUES(status),
             vendor=VALUES(vendor),
             technicianNotes=VALUES(technicianNotes)`,
          [m.id, m.assetId, m.furniture, m.issueDescription, m.scheduledDate || null, m.completedDate || null, m.cost || 0, m.status || 'Scheduled', m.vendor || '', m.technicianNotes || '']
        );
      }
      console.log('✅ Maintenance logs synced.');
    }

    // 10. Disposals
    if (initialDisposals && initialDisposals.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialDisposals.length} disposals into MySQL...`);
      for (const dp of initialDisposals) {
        await pool.query(
          `INSERT INTO disposals (id, assetId, furniture, disposalDate, reason, resaleValue, approvedBy, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             assetId=VALUES(assetId),
             furniture=VALUES(furniture),
             disposalDate=VALUES(disposalDate),
             reason=VALUES(reason),
             resaleValue=VALUES(resaleValue),
             approvedBy=VALUES(approvedBy),
             notes=VALUES(notes)`,
          [dp.id, dp.assetId, dp.furniture, dp.disposalDate, dp.reason, dp.resaleValue || 0, dp.approvedBy || '', dp.notes || '']
        );
      }
      console.log('✅ Disposals synced.');
    }

    // 11. Vendors
    if (initialVendors && initialVendors.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialVendors.length} vendors into MySQL...`);
      for (const v of initialVendors) {
        await pool.query(
          `INSERT INTO vendors (id, name, contactPerson, email, phone, address, gstin, rating, services)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name),
             contactPerson=VALUES(contactPerson),
             email=VALUES(email),
             phone=VALUES(phone),
             address=VALUES(address),
             gstin=VALUES(gstin),
             rating=VALUES(rating),
             services=VALUES(services)`,
          [v.id, v.name, v.contactPerson || '', v.email || '', v.phone || '', v.address || '', v.gstin || '', v.rating || 4.5, v.services || '']
        );
      }
      console.log('✅ Vendors synced.');
    }

    // 12. Audit Logs
    if (initialAuditLogs && initialAuditLogs.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialAuditLogs.length} audit logs into MySQL...`);
      for (const au of initialAuditLogs) {
        await pool.query(
          `INSERT INTO audit_logs (id, userId, userName, userRole, action, entity, entityId, details, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             userId=VALUES(userId),
             userName=VALUES(userName),
             userRole=VALUES(userRole),
             action=VALUES(action),
             entity=VALUES(entity),
             entityId=VALUES(entityId),
             details=VALUES(details)`,
          [au.id, au.userId || null, au.userName || '', au.userRole || '', au.action, au.entity, au.entityId || '', au.details || '', au.created_at || new Date().toISOString()]
        );
      }
      console.log('✅ Audit logs synced.');
    }

    // 13. Categories
    if (initialCategories && initialCategories.length > 0) {
      console.log(`🌱 Seeding/Syncing ${initialCategories.length} categories into MySQL...`);
      for (const c of initialCategories) {
        await pool.query(
          `INSERT INTO categories (id, name, mainCategory, code, icon, depreciationRate, usefulLifeYears, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name=VALUES(name),
             mainCategory=VALUES(mainCategory),
             code=VALUES(code),
             icon=VALUES(icon),
             depreciationRate=VALUES(depreciationRate),
             usefulLifeYears=VALUES(usefulLifeYears),
             description=VALUES(description)`,
          [c.id, c.name, c.mainCategory, c.code, c.icon || 'Box', c.depreciationRate || 10.0, c.usefulLifeYears || 5, c.description || '']
        );
      }
      console.log('✅ Categories synced.');
    }
  } catch (err) {
    console.error('⚠️ Seeding error:', err.message);
  }
}
