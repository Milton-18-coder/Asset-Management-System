import { initialAssets } from '../src/store/furnitureSlice.js';
import {
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
  initialCategories,
  initialPurchaseHistory
} from './initialData.js';
import { initDatabase, getPool } from './db.js';
import { seedInitialDataIfEmpty } from './seedData.js';

async function runAudit() {
  console.log('====================================================');
  console.log('      INSTITUTIONAL ASSET & FINANCIAL AUDIT         ');
  console.log('====================================================');

  // 1. Math audit on all 48 purchase records
  let mathFailures = 0;
  initialPurchaseHistory.forEach(p => {
    const expected = parseFloat((p.purchasePrice * (p.quantity || 1)).toFixed(2));
    if (Math.abs(expected - p.totalAmount) > 0.01) {
      console.error(`[Math Failure] ${p.id}: ${p.purchasePrice} * ${p.quantity} = ${expected}, got ${p.totalAmount}`);
      mathFailures++;
    }
  });
  console.log(`✓ Purchase History Arithmetic Verification: ${initialPurchaseHistory.length} records verified, ${mathFailures} errors.`);

  // 2. Vendor links in purchase history
  const vendorMap = new Map();
  initialVendors.forEach(v => vendorMap.set(v.id, v.name));
  let vendorFailures = 0;
  initialPurchaseHistory.forEach(p => {
    if (!vendorMap.has(p.vendorId)) {
      console.error(`[Missing Vendor ID] ${p.id}: vendorId ${p.vendorId} not found in registered vendors`);
      vendorFailures++;
    } else if (vendorMap.get(p.vendorId) !== p.vendorName) {
      console.error(`[Vendor Name Mismatch] ${p.id}: expected ${vendorMap.get(p.vendorId)}, got ${p.vendorName}`);
      vendorFailures++;
    }
  });
  console.log(`✓ Vendor Identity & ID Consistency: ${vendorFailures} errors.`);

  // 3. Asset links and pricing alignment with latest purchase
  const assetMap = new Map();
  initialAssets.forEach(a => assetMap.set(a.id, a));
  
  const purchasesByAsset = new Map();
  initialPurchaseHistory.forEach(p => {
    if (!purchasesByAsset.has(p.assetId)) purchasesByAsset.set(p.assetId, []);
    purchasesByAsset.get(p.assetId).push(p);
  });

  let priceMismatches = 0;
  let supplierMismatches = 0;
  let missingAssets = 0;

  purchasesByAsset.forEach((purchases, aId) => {
    const asset = assetMap.get(aId);
    if (!asset) {
      console.error(`[Missing Asset] Purchase history references asset ${aId}, not found in initialAssets`);
      missingAssets++;
      return;
    }

    purchases.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
    const latest = purchases[purchases.length - 1];

    if (asset.cost !== latest.purchasePrice) {
      console.error(`[Price Mismatch] Asset ${aId} (${asset.name}): catalog cost ₹${asset.cost} vs latest purchase ₹${latest.purchasePrice}`);
      priceMismatches++;
    }
    if (asset.supplier !== latest.vendorName) {
      console.error(`[Supplier Mismatch] Asset ${aId} (${asset.name}): catalog supplier "${asset.supplier}" vs latest vendor "${latest.vendorName}"`);
      supplierMismatches++;
    }
  });

  console.log(`✓ Asset Catalog vs Purchase History Alignment: ${missingAssets} missing assets, ${priceMismatches} price mismatches, ${supplierMismatches} supplier mismatches.`);

  // 4. Seed into MySQL database
  console.log('\n--- Syncing Reconciled Dataset to MySQL Database ---');
  await initDatabase();
  await seedInitialDataIfEmpty(
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
    initialCategories,
    initialPurchaseHistory
  );

  const pool = getPool();
  const [assetRows] = await pool.query('SELECT COUNT(*) as count FROM assets');
  const [phRows] = await pool.query('SELECT COUNT(*) as count, SUM(totalAmount) as total FROM purchase_history');
  const [vendorRows] = await pool.query('SELECT COUNT(*) as count FROM vendors');
  
  console.log(`\n====================================================`);
  console.log(`MySQL Assets in DB: ${assetRows[0].count}`);
  console.log(`MySQL Purchase Records in DB: ${phRows[0].count} (Total Spend: ₹${Number(phRows[0].total).toLocaleString()})`);
  console.log(`MySQL Vendors in DB: ${vendorRows[0].count}`);
  console.log(`====================================================\n`);

  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
