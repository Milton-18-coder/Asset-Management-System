import { initDatabase, getPool } from './db.js';
import { initialAssets } from './initialData.js';

async function run() {
  await initDatabase();
  const pool = getPool();

  // Normalize legacy departments first
  await pool.query("UPDATE assets SET department = 'Admin Block' WHERE department IN ('Administration', 'Admin', 'Admin Department')");
  await pool.query("UPDATE assets SET department = 'Science & Humanities' WHERE department IN ('Physics', 'Chemistry', 'Mathematics')");
  await pool.query("UPDATE assets SET department = 'Computer Science' WHERE department IN ('CSE', 'Computer Science & Engineering')");
  await pool.query("UPDATE assets SET department = 'Mechanical' WHERE department IN ('ME', 'Mechanical Engineering')");
  await pool.query("UPDATE assets SET department = 'Civil' WHERE department IN ('Civil Engineering', 'CE')");
  await pool.query("UPDATE assets SET department = 'IT' WHERE department IN ('Information Technology', 'IT Department')");
  await pool.query("UPDATE assets SET department = 'AIDS' WHERE department IN ('AI & DS', 'AI-DS', 'Artificial Intelligence & Data Science')");
  await pool.query("UPDATE assets SET department = 'ECE' WHERE department IN ('Electronics & Communication', 'Electronics & Communication Engineering')");
  await pool.query("UPDATE assets SET department = 'EEE' WHERE department IN ('Electrical & Electronics Engineering', 'Electrical & Electronics')");

  console.log(`Syncing ${initialAssets.length} assets into MySQL...`);
  
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
        a.department,
        a.room || 'General',
        a.assignedTo || 'Unassigned',
        a.assignedRole || 'Staff',
        a.assignedEmail || 'admin@nec.edu.in',
        a.condition || 'Good',
        a.status || 'Available',
        a.purchaseDate || '2026-01-01',
        a.cost || 0,
        a.supplier || 'Campus Procurement',
        a.warranty || '1 Year Standard',
        a.quantity || 1,
        a.description || 'General Institutional Asset',
      ]
    );
  }

  const [countRows] = await pool.query(
    'SELECT department, COUNT(*) as asset_count, SUM(quantity) as total_qty FROM assets GROUP BY department ORDER BY department ASC'
  );
  console.log('MySQL Asset stats per department:');
  console.table(countRows);
  process.exit(0);
}

run().catch((err) => {
  console.error('Error during sync:', err);
  process.exit(1);
});
