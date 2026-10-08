import { initDatabase, getPool } from '../server/db.js';
import { notifyAssetStatusChange, normalizeRole } from '../server/services/assetNotificationService.js';
import { normalizePhoneNumber } from '../server/services/whatsappService.js';
import { seedInitialDataIfEmpty } from '../server/seedData.js';
import {
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
} from '../server/initialData.js';

async function runTests() {
  console.log('--- STARTING NOTIFICATION SYSTEM INTEGRATION TESTS ---');
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

  // Test phone normalization
  console.log('\n[Unit Test] Phone normalization:');
  console.log('+91 98765 43210 ->', normalizePhoneNumber('+91 98765 43210'), normalizePhoneNumber('+91 98765 43210') === '919876543210' ? '✓ PASS' : '✗ FAIL');
  console.log('9876543210 ->', normalizePhoneNumber('9876543210'), normalizePhoneNumber('9876543210') === '919876543210' ? '✓ PASS' : '✗ FAIL');

  // Test role normalization
  console.log('\n[Unit Test] Role normalization:');
  console.log('deptadmin ->', normalizeRole('deptadmin'));
  console.log('Department Admin ->', normalizeRole('Department Admin'));
  console.log('dept_admin ->', normalizeRole('dept_admin'));
  console.log('super_admin ->', normalizeRole('super_admin'));
  console.log('Super Administrator ->', normalizeRole('Super Administrator'));
  console.log('auditor ->', normalizeRole('auditor'));

  // Test 1: Computer Science Dept Admin updates AST-001 (Good -> Fair)
  console.log('\n--- TEST 1: CS Dept Admin updates AST-001 (Good -> Fair) ---');
  const [ast1] = await pool.query('SELECT * FROM assets WHERE id = ?', ['AST-001']);
  const prevAsset1 = { ...ast1[0], condition: 'Good' };
  const updatedAsset1 = { ...ast1[0], condition: 'Fair' };
  const csDeptAdmin = {
    id: 'USR-002',
    name: 'Prof. Anitha Sharma',
    role: 'deptadmin',
    department: 'Computer Science',
    email: 'anitha.sharma@nec.edu.in'
  };

  const res1 = await notifyAssetStatusChange({
    asset: updatedAsset1,
    previousAsset: prevAsset1,
    updatedBy: csDeptAdmin
  });
  console.log('Test 1 Result:', JSON.stringify(res1, null, 2));
  const hasSuperAdminRecipient1 = res1.recipients.some(r => r.userId === 'USR-001');
  const hasNoSelfNotification1 = !res1.recipients.some(r => r.userId === 'USR-002');
  const hasNoOtherDeptAdmins1 = !res1.recipients.some(r => r.userId === 'USR-003' || r.userId === 'USR-004');
  console.log('T1 Super Admin recipient:', hasSuperAdminRecipient1 ? '✓ PASS' : '✗ FAIL');
  console.log('T1 No self-notification:', hasNoSelfNotification1 ? '✓ PASS' : '✗ FAIL');
  console.log('T1 No other dept admins:', hasNoOtherDeptAdmins1 ? '✓ PASS' : '✗ FAIL');

  // Test 2: Super Admin updates AST-001 (Fair -> Damaged)
  console.log('\n--- TEST 2: Super Admin updates AST-001 (Fair -> Damaged) ---');
  const prevAsset2 = { ...ast1[0], condition: 'Fair' };
  const updatedAsset2 = { ...ast1[0], condition: 'Damaged' };
  const superAdmin = {
    id: 'USR-001',
    name: 'Dr. Rajesh Kumar',
    role: 'superadmin',
    department: 'Admin Block',
    email: 'rajesh.kumar@nec.edu.in'
  };

  const res2 = await notifyAssetStatusChange({
    asset: updatedAsset2,
    previousAsset: prevAsset2,
    updatedBy: superAdmin
  });
  console.log('Test 2 Result:', JSON.stringify(res2, null, 2));
  const hasCSDeptAdmin2 = res2.recipients.some(r => r.userId === 'USR-002');
  const hasNoMechAdmin2 = !res2.recipients.some(r => r.userId === 'USR-003');
  const hasNoCivilAdmin2 = !res2.recipients.some(r => r.userId === 'USR-004');
  console.log('T2 CS Dept Admin recipient:', hasCSDeptAdmin2 ? '✓ PASS' : '✗ FAIL');
  console.log('T2 Mech Admin NOT notified:', hasNoMechAdmin2 ? '✓ PASS' : '✗ FAIL');
  console.log('T2 Civil Admin NOT notified:', hasNoCivilAdmin2 ? '✓ PASS' : '✗ FAIL');

  // Test 3: Same condition (Damaged -> Damaged)
  console.log('\n--- TEST 3: Same condition (Damaged -> Damaged) ---');
  const res3 = await notifyAssetStatusChange({
    asset: { ...ast1[0], condition: 'Damaged' },
    previousAsset: { ...ast1[0], condition: 'Damaged' },
    updatedBy: csDeptAdmin
  });
  console.log('Test 3 Result (Should not trigger):', JSON.stringify(res3, null, 2));
  console.log('T3 Triggered is false:', res3.triggered === false ? '✓ PASS' : '✗ FAIL');

  // Test 7: Unrelated / unknown department
  console.log('\n--- TEST 7: Invalid/Unknown department ---');
  const res7 = await notifyAssetStatusChange({
    asset: { id: 'AST-999', name: 'Unknown Asset', department: 'Astronomy', condition: 'Damaged' },
    previousAsset: { id: 'AST-999', name: 'Unknown Asset', department: 'Astronomy', condition: 'Good' },
    updatedBy: superAdmin
  });
  console.log('Test 7 Result (No matching dept admin for Astronomy):', JSON.stringify(res7, null, 2));
  console.log('T7 Recipients empty for unknown dept:', res7.recipients.length === 0 ? '✓ PASS' : '✗ FAIL');

  // Test 8: Faculty / Auditor updates asset condition
  console.log('\n--- TEST 8: Auditor / Faculty updates asset condition ---');
  const auditorUser = {
    id: 'USR-011',
    name: 'Mr. Ravi Shankar',
    role: 'auditor',
    department: 'Admin Block',
    email: 'ravi.shankar@nec.edu.in'
  };
  const res8 = await notifyAssetStatusChange({
    asset: { ...ast1[0], condition: 'Damaged' },
    previousAsset: { ...ast1[0], condition: 'Good' },
    updatedBy: auditorUser
  });
  console.log('Test 8 Result (Auditor role skipped):', JSON.stringify(res8, null, 2));
  console.log('T8 Workflow skipped for auditor:', res8.triggered === false && res8.skipped === true ? '✓ PASS' : '✗ FAIL');

  console.log('\n--- ALL TEST SCENARIOS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
