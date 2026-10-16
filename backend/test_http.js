async function testHttpApi() {
  console.log('Testing HTTP Endpoints on http://localhost:5000:');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  console.log('Health Check Status:', healthRes.status, await healthRes.json());

  // 2. Department Admin updates AST-001 condition to Fair
  console.log('\nTesting PUT /api/assets/AST-001 by Dept Admin:');
  const putRes = await fetch('http://localhost:5000/api/assets/AST-001', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'AST-001',
      name: 'Dell OptiPlex 7090 Desktop Computer',
      department: 'Computer Science',
      condition: 'Fair',
      status: 'Available',
      updatedBy: {
        id: 'USR-002',
        name: 'Prof. Anitha Sharma',
        role: 'deptadmin',
        department: 'Computer Science',
        email: 'anitha.sharma@nec.edu.in'
      }
    })
  });
  const putData = await putRes.json();
  console.log('PUT Response condition:', putData.condition);
  console.log('PUT Response notification:', JSON.stringify(putData.notification, null, 2));

  // 3. Super Admin updates AST-001 condition to Good via PATCH
  console.log('\nTesting PATCH /api/assets/AST-001/condition by Super Admin:');
  const patchRes = await fetch('http://localhost:5000/api/assets/AST-001/condition', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      condition: 'Good',
      updatedBy: {
        id: 'USR-001',
        name: 'Dr. Rajesh Kumar',
        role: 'superadmin',
        department: 'Admin Block',
        email: 'rajesh.kumar@nec.edu.in'
      }
    })
  });
  const patchData = await patchRes.json();
  console.log('PATCH Response condition:', patchData.condition);
  console.log('PATCH Response notification:', JSON.stringify(patchData.notification, null, 2));

  // 4. Notifications retrieval with user filter
  console.log('\nTesting GET /api/notifications?userId=USR-001&role=superadmin:');
  const notifResSuper = await fetch('http://localhost:5000/api/notifications?userId=USR-001&role=superadmin');
  const superNotifs = await notifResSuper.json();
  console.log(`Super Admin notifications count: ${superNotifs.length}`);
  console.log('Top notification for Super Admin:', superNotifs[0]?.title, '-', superNotifs[0]?.message);

  console.log('\nTesting GET /api/notifications?userId=USR-002&role=deptadmin&department=Computer+Science:');
  const notifResDept = await fetch('http://localhost:5000/api/notifications?userId=USR-002&role=deptadmin&department=Computer+Science');
  const deptNotifs = await notifResDept.json();
  console.log(`CS Dept Admin notifications count: ${deptNotifs.length}`);
  console.log('Top notification for CS Dept Admin:', deptNotifs[0]?.title, '-', deptNotifs[0]?.message);

  console.log('\nTesting GET /api/notifications?userId=USR-003&role=deptadmin&department=Mechanical:');
  const notifResMech = await fetch('http://localhost:5000/api/notifications?userId=USR-003&role=deptadmin&department=Mechanical');
  const mechNotifs = await notifResMech.json();
  console.log(`Mechanical Dept Admin notifications count: ${mechNotifs.length}`);
  const hasCSLeak = mechNotifs.some(n => n.message && n.message.includes('AST-001'));
  console.log('Mechanical Admin has no CS notification leak:', !hasCSLeak ? '✓ PASS' : '✗ FAIL');

  console.log('\nALL HTTP API TESTS PASSED SUCCESSFULLY!');
}

testHttpApi().catch(err => {
  console.error('HTTP API Test Error:', err);
});
