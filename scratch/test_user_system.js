const API = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== RUNNING ASSETMS USER & NOTIFICATION VERIFICATION TESTS ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Health check
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    console.log(`[TEST 1] Server Health: ${data.status} (DB: ${data.database})`);
    if (data.status === 'ok') passed++; else failed++;
  } catch (e) {
    console.error('[TEST 1] Health check failed:', e.message);
    failed++;
  }

  // 2. User list validation (No passwords exposed, phone & role & dept properly populated)
  try {
    const res = await fetch(`${API}/users`);
    const users = await res.json();
    const superadmin = users.find(u => u.username === 'superadmin');
    const csAdmin = users.find(u => u.username === 'cs_admin' || u.username === 'deptadmin');
    const hasPassword = users.some(u => u.password !== undefined);

    console.log(`[TEST 2] Users fetched (${users.length} users). Passwords exposed in API: ${hasPassword}`);
    console.log(`[TEST 2] Super Admin: role=${superadmin?.role}, phone=${superadmin?.phone}, dept=${superadmin?.department}`);
    console.log(`[TEST 2] Dept Admin: role=${csAdmin?.role}, phone=${csAdmin?.phone}, dept=${csAdmin?.department}`);

    if (!hasPassword && superadmin && csAdmin && superadmin.role === 'superadmin' && csAdmin.role === 'deptadmin') {
      console.log('✓ TEST 2 PASSED: Users have correct roles and passwords are never exposed');
      passed++;
    } else {
      console.error('✗ TEST 2 FAILED');
      failed++;
    }
  } catch (e) {
    console.error('[TEST 2] Error:', e.message);
    failed++;
  }

  // 3. Create a test user with phone normalization
  let testUserId = `TST-${Date.now().toString().slice(-4)}`;
  try {
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testUserId,
        username: `test_user_${testUserId}`,
        name: 'Test Department Coordinator',
        email: 'test_coord@nec.edu.in',
        phone: '+91 98765 43210',
        role: 'deptadmin',
        department: 'Mechanical'
      })
    });
    const created = await res.json();
    console.log(`[TEST 3] Created user phone normalization: input="+91 98765 43210" -> stored="${created.phone}"`);
    if (res.status === 201 && created.phone === '919876543210' && created.password === undefined) {
      console.log('✓ TEST 3 PASSED: User created with proper phone normalization and no password leakage');
      passed++;
    } else {
      console.error('✗ TEST 3 FAILED:', created);
      failed++;
    }
  } catch (e) {
    console.error('[TEST 3] Error:', e.message);
    failed++;
  }

  // 4. Update user profile / phone
  try {
    const res = await fetch(`${API}/users/${testUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Department Coordinator Updated',
        phone: '+91 91234 56789',
        department: 'Mechanical'
      })
    });
    const updated = await res.json();
    console.log(`[TEST 4] Updated user phone: "${updated.phone}"`);
    if (updated.phone === '919123456789' && updated.name === 'Test Department Coordinator Updated') {
      console.log('✓ TEST 4 PASSED: User phone updated and normalized in DB');
      passed++;
    } else {
      console.error('✗ TEST 4 FAILED:', updated);
      failed++;
    }
  } catch (e) {
    console.error('[TEST 4] Error:', e.message);
    failed++;
  }

  // 5. Dept Admin unauthorized asset update rejection (Dept Admin from Mechanical tries to update Computer Science asset)
  try {
    const res = await fetch(`${API}/assets/AST-001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        condition: 'Damaged',
        updatedBy: {
          id: testUserId,
          name: 'Mechanical Dept Admin',
          role: 'deptadmin',
          department: 'Mechanical' // Asset AST-001 is Computer Science
        }
      })
    });
    const data = await res.json();
    console.log(`[TEST 5] Cross-department modification HTTP status: ${res.status} (Error: ${data.error})`);
    if (res.status === 403) {
      console.log('✓ TEST 5 PASSED: Backend properly rejected cross-department asset update');
      passed++;
    } else {
      console.error('✗ TEST 5 FAILED: Expected 403 Forbidden');
      failed++;
    }
  } catch (e) {
    console.error('[TEST 5] Error:', e.message);
    failed++;
  }

  // 6. Authorized Dept Admin updates asset (Computer Science Dept Admin updates AST-001: Good -> Damaged)
  try {
    const res = await fetch(`${API}/assets/AST-001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        condition: 'Damaged',
        status: 'Needs Inspection',
        updatedBy: {
          id: 'USR-002',
          name: 'Prof. Anitha Sharma',
          role: 'deptadmin',
          department: 'Computer Science'
        }
      })
    });
    const data = await res.json();
    console.log(`[TEST 6] Dept Admin condition update (Good -> Damaged): HTTP ${res.status}`);
    console.log(`[TEST 6] Notification triggered: ${data.notification?.triggered}, direction=${data.notification?.direction}`);
    console.log(`[TEST 6] Recipients notified: ${data.notification?.recipients?.length || 0}`);
    if (res.status === 200 && data.notification?.triggered && data.notification?.direction === 'deptadmin_to_superadmin') {
      console.log('✓ TEST 6 PASSED: Dept Admin condition change successfully dispatched to Super Admin');
      passed++;
    } else {
      console.error('✗ TEST 6 FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('[TEST 6] Error:', e.message);
    failed++;
  }

  // 7. Same condition update: Good -> Good (No notification triggered)
  try {
    const res = await fetch(`${API}/assets/AST-001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        condition: 'Damaged', // It is currently Damaged, so Damaged -> Damaged
        status: 'Needs Inspection',
        updatedBy: {
          id: 'USR-002',
          name: 'Prof. Anitha Sharma',
          role: 'deptadmin',
          department: 'Computer Science'
        }
      })
    });
    const data = await res.json();
    console.log(`[TEST 7] No-op condition update (Damaged -> Damaged): notification=${data.notification}`);
    if (res.status === 200 && !data.notification) {
      console.log('✓ TEST 7 PASSED: No notification sent when condition is unchanged');
      passed++;
    } else {
      console.error('✗ TEST 7 FAILED: Expected no notification');
      failed++;
    }
  } catch (e) {
    console.error('[TEST 7] Error:', e.message);
    failed++;
  }

  // 8. Super Admin updates asset (Super Admin updates AST-001: Damaged -> Good)
  try {
    const res = await fetch(`${API}/assets/AST-001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        condition: 'Good',
        status: 'Available',
        updatedBy: {
          id: 'USR-001',
          name: 'Dr. Rajesh Kumar',
          role: 'superadmin'
        }
      })
    });
    const data = await res.json();
    console.log(`[TEST 8] Super Admin update (Damaged -> Good): notification direction=${data.notification?.direction}`);
    console.log(`[TEST 8] Recipients notified: ${data.notification?.recipients?.map(r => `${r.name} (${r.userId})`).join(', ')}`);
    if (res.status === 200 && data.notification?.triggered && data.notification?.direction === 'superadmin_to_deptadmin') {
      console.log('✓ TEST 8 PASSED: Super Admin condition update routed specifically to Computer Science Dept Admin');
      passed++;
    } else {
      console.error('✗ TEST 8 FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('[TEST 8] Error:', e.message);
    failed++;
  }

  // Cleanup test user
  try {
    await fetch(`${API}/users/${testUserId}`, { method: 'DELETE' });
  } catch (e) {
    // cleanup
  }

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
}

runTests();
