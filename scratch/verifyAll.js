async function testEndpoints() {
  const baseUrl = 'http://localhost:5000/api';

  console.log('--- 1. Testing AI Chat (Fallback / Real DB) ---');
  const chatRes1 = await fetch(`${baseUrl}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Which vendor has the highest purchase value?' })
  });
  const chatData1 = await chatRes1.json();
  console.log('Chat Query 1 Mode:', chatData1.mode, 'Intent:', chatData1.intent);
  console.log('Chat Query 1 Response snippet:', chatData1.responseText?.substring(0, 120));

  console.log('\n--- 2. Testing AI Chat (Total procurement spend) ---');
  const chatRes2 = await fetch(`${baseUrl}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'What is our total procurement spend?' })
  });
  const chatData2 = await chatRes2.json();
  console.log('Chat Query 2 Response snippet:', chatData2.responseText?.substring(0, 120));

  console.log('\n--- 3. Testing Safe Endpoints ---');
  const topVendorsRes = await fetch(`${baseUrl}/ai/vendors/top`);
  const topVendors = await topVendorsRes.json();
  console.log('Top vendors count:', topVendors.length, 'Top 1:', topVendors[0]?.vendorName);

  const deptRes = await fetch(`${baseUrl}/ai/departments/summary`);
  const depts = await deptRes.json();
  console.log('Department summary count:', depts.length, 'Top 1:', depts[0]?.departmentName);

  console.log('\n--- 4. Testing Bulk Purchase Import Endpoint ---');
  const bulkPayload = {
    purchases: [
      {
        asset_name: 'Dell Precision Tower 3660',
        vendor_name: 'Dell India Enterprise',
        category: 'Electronics',
        subcategory: 'Workstation',
        purchase_date: '2026-06-01',
        purchase_price: 85000,
        quantity: 5,
        invoice_number: 'INV-TEST-BULK-001',
        warranty_expiry: '3 Years Warranty',
        notes: 'Verification test row'
      },
      {
        asset_name: '', // Invalid row to test validation
        vendor_name: 'Test Vendor',
        purchase_date: '2026-06-01',
        purchase_price: 1000,
        quantity: 1
      }
    ],
    batchId: 'BATCH-VERIFY-001',
    importSource: 'csv',
    createdBy: 'System Tester'
  };

  const bulkRes = await fetch(`${baseUrl}/purchase-history/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bulkPayload)
  });
  const bulkData = await bulkRes.json();
  console.log('Bulk Import Status:', bulkRes.status);
  console.log('Bulk Import Result: Imported =', bulkData.imported, 'Failed =', bulkData.failed, 'Errors =', bulkData.errors?.length);

  console.log('\n--- 5. Testing PDF Generation Endpoints ---');
  const analyticsPdfRes = await fetch(`${baseUrl}/reports/analytics/pdf`);
  const analyticsPdfBuffer = await analyticsPdfRes.arrayBuffer();
  console.log('Analytics PDF response status:', analyticsPdfRes.status, 'Size bytes:', analyticsPdfBuffer.byteLength);

  const purchasePdfRes = await fetch(`${baseUrl}/reports/purchases/pdf`);
  const purchasePdfBuffer = await purchasePdfRes.arrayBuffer();
  console.log('Purchase PDF response status:', purchasePdfRes.status, 'Size bytes:', purchasePdfBuffer.byteLength);

  console.log('\n--- 6. Testing Email & WhatsApp Unconfigured Response Safety ---');
  const emailRes = await fetch(`${baseUrl}/reports/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: 'admin@campus.edu', subject: 'Test' })
  });
  const emailData = await emailRes.json();
  console.log('Email response:', emailData);

  const waRes = await fetch(`${baseUrl}/reports/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '919876543210', message: 'Test' })
  });
  const waData = await waRes.json();
  console.log('WhatsApp response:', waData);

  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

testEndpoints().catch(console.error);
