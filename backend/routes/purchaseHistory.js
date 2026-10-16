import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

// 1. GET overall procurement statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = getPool();
    
    // Overall KPIs
    const [overallRows] = await pool.query(`
      SELECT 
        COALESCE(SUM(totalAmount), 0) AS totalPurchaseValue,
        COALESCE(SUM(quantity), 0) AS totalUnitsPurchased,
        COUNT(*) AS totalTransactions,
        COUNT(DISTINCT vendorName) AS totalVendors,
        COUNT(DISTINCT assetId) AS totalAssetsPurchased,
        COALESCE(AVG(purchasePrice), 0) AS averageUnitPrice,
        COALESCE(MIN(purchasePrice), 0) AS minUnitPrice,
        COALESCE(MAX(purchasePrice), 0) AS maxUnitPrice
      FROM purchase_history
    `);

    // Monthly Spend Trend
    const [monthlyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(purchaseDate, '%Y-%m') AS monthYear,
        DATE_FORMAT(purchaseDate, '%b %Y') AS monthLabel,
        COALESCE(SUM(totalAmount), 0) AS totalSpent,
        COALESCE(SUM(quantity), 0) AS units,
        COUNT(*) AS transactions
      FROM purchase_history
      GROUP BY monthYear, monthLabel
      ORDER BY monthYear ASC
    `);

    // Spend by Category
    const [categoryRows] = await pool.query(`
      SELECT 
        categoryName,
        COALESCE(SUM(totalAmount), 0) AS totalSpent,
        COALESCE(SUM(quantity), 0) AS units,
        COUNT(*) AS transactions,
        COUNT(DISTINCT subcategoryName) AS subcategoriesCount
      FROM purchase_history
      GROUP BY categoryName
      ORDER BY totalSpent DESC
    `);

    // Spend by Top Vendors
    const [vendorRows] = await pool.query(`
      SELECT 
        vendorId,
        vendorName,
        COALESCE(SUM(totalAmount), 0) AS totalSpent,
        COALESCE(SUM(quantity), 0) AS units,
        COUNT(*) AS transactions,
        MIN(purchaseDate) AS firstPurchaseDate,
        MAX(purchaseDate) AS latestPurchaseDate
      FROM purchase_history
      GROUP BY vendorId, vendorName
      ORDER BY totalSpent DESC
      LIMIT 10
    `);

    res.json({
      summary: overallRows[0],
      monthlyTrend: monthlyRows,
      categoryBreakdown: categoryRows,
      topVendors: vendorRows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET by Date Range (inclusive query)
router.get('/date-range', async (req, res) => {
  try {
    const pool = getPool();
    const { from, to, vendorId, category, subcategory } = req.query;

    let sql = 'SELECT * FROM purchase_history WHERE 1=1';
    const params = [];

    if (from) {
      sql += ' AND purchaseDate >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND purchaseDate <= ?';
      params.push(to);
    }
    if (vendorId) {
      sql += ' AND (vendorId = ? OR vendorName = ?)';
      params.push(vendorId, vendorId);
    }
    if (category && category !== 'All') {
      sql += ' AND categoryName = ?';
      params.push(category);
    }
    if (subcategory && subcategory !== 'All') {
      sql += ' AND subcategoryName = ?';
      params.push(subcategory);
    }

    sql += ' ORDER BY purchaseDate DESC';

    const [rows] = await pool.query(sql, params);

    const totalSpent = rows.reduce((s, r) => s + parseFloat(r.totalAmount || 0), 0);
    const totalUnits = rows.reduce((s, r) => s + parseInt(r.quantity || 1, 10), 0);

    res.json({
      dateRange: { from: from || null, to: to || null },
      count: rows.length,
      totalSpent,
      totalUnits,
      purchases: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET vendor purchases with optional date range & subcategory filters
router.get('/vendor/:vendorId/date-range', async (req, res) => {
  try {
    const pool = getPool();
    const { vendorId } = req.params;
    const { from, to, category, subcategory, asset } = req.query;

    let sql = 'SELECT * FROM purchase_history WHERE (vendorId = ? OR vendorName = ?)';
    const params = [vendorId, vendorId];

    if (from) {
      sql += ' AND purchaseDate >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND purchaseDate <= ?';
      params.push(to);
    }
    if (category && category !== 'All') {
      sql += ' AND categoryName = ?';
      params.push(category);
    }
    if (subcategory && subcategory !== 'All') {
      sql += ' AND subcategoryName = ?';
      params.push(subcategory);
    }
    if (asset) {
      sql += ' AND (assetName LIKE ? OR assetId LIKE ?)';
      params.push(`%${asset}%`, `%${asset}%`);
    }

    sql += ' ORDER BY purchaseDate DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET vendor purchase history with vendor information and summary
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const pool = getPool();
    const { vendorId } = req.params;

    // Get vendor details if exists in vendors table
    const [vendorRows] = await pool.query('SELECT * FROM vendors WHERE id = ? OR name = ?', [vendorId, vendorId]);
    const vendorInfo = vendorRows[0] || null;

    const [purchases] = await pool.query(
      'SELECT * FROM purchase_history WHERE vendorId = ? OR vendorName = ? ORDER BY purchaseDate DESC',
      [vendorId, vendorInfo ? vendorInfo.name : vendorId]
    );

    const totalSpend = purchases.reduce((s, p) => s + parseFloat(p.totalAmount || 0), 0);
    const totalUnits = purchases.reduce((s, p) => s + parseInt(p.quantity || 1, 10), 0);
    const categoriesSupplied = Array.from(new Set(purchases.map(p => p.categoryName).filter(Boolean)));
    const subcategoriesSupplied = Array.from(new Set(purchases.map(p => p.subcategoryName).filter(Boolean)));
    const uniqueAssets = Array.from(new Set(purchases.map(p => p.assetName).filter(Boolean)));

    res.json({
      vendor: vendorInfo || { id: vendorId, name: purchases[0]?.vendorName || vendorId },
      summary: {
        totalSpend,
        totalUnits,
        transactionCount: purchases.length,
        uniqueProductsCount: uniqueAssets.length,
        categoriesSupplied,
        subcategoriesSupplied,
        firstPurchaseDate: purchases.length > 0 ? purchases[purchases.length - 1].purchaseDate : null,
        latestPurchaseDate: purchases.length > 0 ? purchases[0].purchaseDate : null,
      },
      purchases
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET complete purchase history and price tracking analytics for a specific asset
router.get('/asset/:assetId', async (req, res) => {
  try {
    const pool = getPool();
    const { assetId } = req.params;

    const [purchases] = await pool.query(
      'SELECT * FROM purchase_history WHERE assetId = ? OR assetName = ? ORDER BY purchaseDate ASC',
      [assetId, assetId]
    );

    if (purchases.length === 0) {
      // Check if asset exists in assets table
      const [assetRows] = await pool.query('SELECT * FROM assets WHERE id = ?', [assetId]);
      return res.json({
        asset: assetRows[0] || null,
        summary: {
          latestPrice: assetRows[0]?.cost || 0,
          previousPrice: null,
          lowestPrice: assetRows[0]?.cost || 0,
          highestPrice: assetRows[0]?.cost || 0,
          averagePrice: assetRows[0]?.cost || 0,
          totalQuantity: assetRows[0]?.quantity || 1,
          totalSpent: (assetRows[0]?.cost || 0) * (assetRows[0]?.quantity || 1),
          transactionCount: 0,
          priceHistory: []
        },
        purchases: []
      });
    }

    const prices = purchases.map(p => parseFloat(p.purchasePrice || 0));
    const quantities = purchases.map(p => parseInt(p.quantity || 1, 10));
    const totalAmounts = purchases.map(p => parseFloat(p.totalAmount || 0));

    const latest = purchases[purchases.length - 1];
    const previous = purchases.length > 1 ? purchases[purchases.length - 2] : null;

    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const totalQuantity = quantities.reduce((a, b) => a + b, 0);
    const totalSpent = totalAmounts.reduce((a, b) => a + b, 0);
    const averagePrice = totalSpent / (totalQuantity || 1);

    const priceHistory = purchases.map(p => ({
      id: p.id,
      date: p.purchaseDate,
      price: parseFloat(p.purchasePrice),
      vendor: p.vendorName,
      vendorId: p.vendorId,
      quantity: p.quantity,
      totalAmount: parseFloat(p.totalAmount),
      invoiceNumber: p.invoiceNumber
    }));

    res.json({
      assetId: purchases[0].assetId,
      assetName: purchases[0].assetName,
      categoryName: purchases[0].categoryName,
      subcategoryName: purchases[0].subcategoryName,
      summary: {
        latestPrice: parseFloat(latest.purchasePrice),
        latestPurchaseDate: latest.purchaseDate,
        latestVendor: latest.vendorName,
        previousPrice: previous ? parseFloat(previous.purchasePrice) : null,
        previousPurchaseDate: previous ? previous.purchaseDate : null,
        priceChangePercentage: previous 
          ? (((parseFloat(latest.purchasePrice) - parseFloat(previous.purchasePrice)) / parseFloat(previous.purchasePrice)) * 100).toFixed(1) 
          : 0,
        lowestPrice,
        highestPrice,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
        totalQuantity,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        transactionCount: purchases.length,
        priceHistory
      },
      purchases: [...purchases].reverse() // Return newest first for tabular presentation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET category-wise purchase analysis grouped by subcategory
router.get('/category/:categoryId', async (req, res) => {
  try {
    const pool = getPool();
    const { categoryId } = req.params;

    const [purchases] = await pool.query(
      'SELECT * FROM purchase_history WHERE categoryName = ? OR categoryId = ? ORDER BY purchaseDate DESC',
      [categoryId, categoryId]
    );

    // Group purchases by subcategory
    const subcategoryMap = {};
    for (const p of purchases) {
      const sub = p.subcategoryName || 'General';
      if (!subcategoryMap[sub]) {
        subcategoryMap[sub] = {
          subcategoryName: sub,
          subcategoryId: p.subcategoryId,
          totalSpent: 0,
          totalUnits: 0,
          transactionCount: 0,
          vendors: new Set(),
          minPrice: Infinity,
          maxPrice: -Infinity,
          purchases: []
        };
      }
      subcategoryMap[sub].purchases.push(p);
      subcategoryMap[sub].totalSpent += parseFloat(p.totalAmount || 0);
      subcategoryMap[sub].totalUnits += parseInt(p.quantity || 1, 10);
      subcategoryMap[sub].transactionCount += 1;
      subcategoryMap[sub].vendors.add(p.vendorName);
      subcategoryMap[sub].minPrice = Math.min(subcategoryMap[sub].minPrice, parseFloat(p.purchasePrice || 0));
      subcategoryMap[sub].maxPrice = Math.max(subcategoryMap[sub].maxPrice, parseFloat(p.purchasePrice || 0));
    }

    const subcategories = Object.values(subcategoryMap).map(sub => ({
      ...sub,
      vendorsCount: sub.vendors.size,
      vendorsList: Array.from(sub.vendors),
      averagePrice: sub.totalUnits > 0 ? parseFloat((sub.totalSpent / sub.totalUnits).toFixed(2)) : 0,
      minPrice: sub.minPrice === Infinity ? 0 : sub.minPrice,
      maxPrice: sub.maxPrice === -Infinity ? 0 : sub.maxPrice,
      vendors: undefined
    }));

    const totalCategorySpend = purchases.reduce((s, p) => s + parseFloat(p.totalAmount || 0), 0);
    const totalCategoryUnits = purchases.reduce((s, p) => s + parseInt(p.quantity || 1, 10), 0);

    res.json({
      categoryName: categoryId,
      totalSpent: totalCategorySpend,
      totalUnits: totalCategoryUnits,
      transactionCount: purchases.length,
      subcategoriesCount: subcategories.length,
      subcategories,
      allPurchases: purchases
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET subcategory-wise purchase analysis with summary statistics
router.get('/subcategory/:subcategoryId', async (req, res) => {
  try {
    const pool = getPool();
    const { subcategoryId } = req.params;

    const [purchases] = await pool.query(
      'SELECT * FROM purchase_history WHERE subcategoryName = ? OR subcategoryId = ? ORDER BY purchaseDate DESC',
      [subcategoryId, subcategoryId]
    );

    if (purchases.length === 0) {
      return res.json({
        subcategoryName: subcategoryId,
        totalUnitsPurchased: 0,
        totalExpenditure: 0,
        averagePrice: 0,
        minimumPrice: 0,
        maximumPrice: 0,
        numberOfVendors: 0,
        numberOfTransactions: 0,
        purchases: []
      });
    }

    const prices = purchases.map(p => parseFloat(p.purchasePrice || 0));
    const totalExpenditure = purchases.reduce((s, p) => s + parseFloat(p.totalAmount || 0), 0);
    const totalUnitsPurchased = purchases.reduce((s, p) => s + parseInt(p.quantity || 1, 10), 0);
    const vendorsSet = new Set(purchases.map(p => p.vendorName));

    res.json({
      subcategoryName: purchases[0].subcategoryName,
      categoryName: purchases[0].categoryName,
      totalUnitsPurchased,
      totalExpenditure,
      averagePrice: totalUnitsPurchased > 0 ? parseFloat((totalExpenditure / totalUnitsPurchased).toFixed(2)) : 0,
      minimumPrice: Math.min(...prices),
      maximumPrice: Math.max(...prices),
      numberOfVendors: vendorsSet.size,
      vendors: Array.from(vendorsSet),
      numberOfTransactions: purchases.length,
      purchases
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. GET single purchase transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM purchase_history WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Purchase record not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. GET all purchase records with flexible filtering & search
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const { vendorId, vendorName, assetId, category, subcategory, from, to, search, limit = 500 } = req.query;

    let sql = 'SELECT * FROM purchase_history WHERE 1=1';
    const params = [];

    if (vendorId) {
      sql += ' AND vendorId = ?';
      params.push(vendorId);
    }
    if (vendorName) {
      sql += ' AND vendorName = ?';
      params.push(vendorName);
    }
    if (assetId) {
      sql += ' AND assetId = ?';
      params.push(assetId);
    }
    if (category && category !== 'All') {
      sql += ' AND categoryName = ?';
      params.push(category);
    }
    if (subcategory && subcategory !== 'All') {
      sql += ' AND subcategoryName = ?';
      params.push(subcategory);
    }
    if (from) {
      sql += ' AND purchaseDate >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND purchaseDate <= ?';
      params.push(to);
    }
    if (search) {
      sql += ' AND (assetName LIKE ? OR vendorName LIKE ? OR invoiceNumber LIKE ? OR notes LIKE ? OR itemType LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY purchaseDate DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. POST Bulk Purchase Import (CSV / Batch Processing)
router.post('/bulk', async (req, res) => {
  const pool = getPool();
  let connection = null;
  try {
    const { purchases = [], batchId, importSource = 'csv', createdBy = 'System User' } = req.body;

    if (!Array.isArray(purchases) || purchases.length === 0) {
      return res.status(400).json({ error: 'No purchase records provided for bulk import.' });
    }

    const currentBatchId = batchId || `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const validRecords = [];
    const errors = [];

    // Fetch all existing vendors to auto-resolve vendor IDs
    const [existingVendors] = await pool.query('SELECT id, name FROM vendors');
    const vendorMap = new Map();
    existingVendors.forEach(v => {
      vendorMap.set(v.name.toLowerCase().trim(), v.id);
    });

    // Row-by-row backend validation
    purchases.forEach((row, idx) => {
      const rowNum = row.rowNumber || idx + 1;
      const assetName = (row.asset_name || row.assetName || '').trim();
      const vendorName = (row.vendor_name || row.vendorName || '').trim();
      const purchaseDate = row.purchase_date || row.purchaseDate;
      const rawPrice = row.purchase_price !== undefined ? row.purchase_price : row.purchasePrice;
      const rawQty = row.quantity !== undefined ? row.quantity : row.qty;

      const rowErrors = [];

      if (!assetName) {
        rowErrors.push('Asset name is required');
      }
      if (!vendorName) {
        rowErrors.push('Vendor name is required');
      }
      if (!purchaseDate || isNaN(new Date(purchaseDate).getTime())) {
        rowErrors.push('Valid purchase date is required');
      }

      const priceNum = parseFloat(rawPrice);
      if (isNaN(priceNum) || priceNum < 0) {
        rowErrors.push('Purchase price must be a valid non-negative number');
      }

      const qtyNum = parseInt(rawQty, 10);
      if (isNaN(qtyNum) || qtyNum < 1) {
        rowErrors.push('Quantity must be an integer greater than or equal to 1');
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNum,
          asset: assetName || 'Unknown Asset',
          vendor: vendorName || 'Unknown Vendor',
          errors: rowErrors,
          message: rowErrors.join(', ')
        });
      } else {
        const totalAmount = parseFloat((priceNum * qtyNum).toFixed(2));
        const purchaseId = `PUR-B-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
        const assetId = row.assetId || row.asset_id || `AST-B-${Date.now()}-${idx}`;
        const resolvedVendorId = row.vendorId || vendorMap.get(vendorName.toLowerCase()) || null;

        validRecords.push({
          id: purchaseId,
          assetId,
          assetName,
          vendorId: resolvedVendorId,
          vendorName,
          categoryId: row.categoryId || row.category_id || null,
          categoryName: (row.category || row.categoryName || 'Furniture').trim(),
          subcategoryId: row.subcategoryId || row.subcategory_id || null,
          subcategoryName: (row.subcategory || row.subcategoryName || 'General').trim(),
          itemType: (row.item_type || row.itemType || row.subcategory || 'General').trim(),
          purchaseDate: new Date(purchaseDate).toISOString().split('T')[0],
          purchasePrice: priceNum,
          quantity: qtyNum,
          totalAmount,
          invoiceNumber: (row.invoice_number || row.invoiceNumber || '').trim(),
          invoiceDate: row.invoice_date || row.invoiceDate ? new Date(row.invoice_date || row.invoiceDate).toISOString().split('T')[0] : new Date(purchaseDate).toISOString().split('T')[0],
          warrantyExpiry: (row.warranty_expiry || row.warrantyExpiry || '1 Year Standard').trim(),
          notes: (row.notes || '').trim(),
          batch_id: currentBatchId,
          import_source: importSource,
          created_by: createdBy
        });
      }
    });

    if (validRecords.length === 0) {
      return res.status(400).json({
        success: false,
        imported: 0,
        failed: errors.length,
        batchId: currentBatchId,
        errors,
        message: 'No valid purchase records found in the import payload.'
      });
    }

    // Execute atomic MySQL transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const insertSql = `
      INSERT INTO purchase_history (
        id, assetId, assetName, vendorId, vendorName, categoryId, categoryName,
        subcategoryId, subcategoryName, itemType, purchaseDate, purchasePrice,
        quantity, totalAmount, invoiceNumber, invoiceDate, warrantyExpiry, notes,
        batch_id, import_source, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const rec of validRecords) {
      await connection.query(insertSql, [
        rec.id,
        rec.assetId,
        rec.assetName,
        rec.vendorId,
        rec.vendorName,
        rec.categoryId,
        rec.categoryName,
        rec.subcategoryId,
        rec.subcategoryName,
        rec.itemType,
        rec.purchaseDate,
        rec.purchasePrice,
        rec.quantity,
        rec.totalAmount,
        rec.invoiceNumber,
        rec.invoiceDate,
        rec.warrantyExpiry,
        rec.notes,
        rec.batch_id,
        rec.import_source,
        rec.created_by
      ]);

      // If asset exists in assets table, update its cost/supplier/warranty/purchaseDate
      try {
        await connection.query(
          `UPDATE assets 
           SET cost = ?, supplier = ?, purchaseDate = ?, warranty = COALESCE(NULLIF(?, ''), warranty)
           WHERE id = ? OR name = ?`,
          [rec.purchasePrice, rec.vendorName, rec.purchaseDate, rec.warrantyExpiry, rec.assetId, rec.assetName]
        );
      } catch (e) {
        // Continue if asset update is not applicable
      }
    }

    // Create a system notification for the bulk import
    const notifId = `NOTIF-${Date.now()}`;
    await connection.query(
      `INSERT INTO notifications (id, title, message, time, \`read\`, type, link)
       VALUES (?, ?, ?, ?, 0, 'purchase', '/purchases')`,
      [
        notifId,
        'Bulk Purchase Import Completed',
        `${validRecords.length} purchase transaction${validRecords.length === 1 ? '' : 's'} imported successfully into batch ${currentBatchId}.` + (errors.length > 0 ? ` (${errors.length} failed)` : ''),
        'Just now'
      ]
    );

    // Audit log
    try {
      await connection.query(
        `INSERT INTO audit_logs (id, userId, userName, userRole, action, entity, entityId, details)
         VALUES (?, ?, ?, ?, 'BULK_IMPORT', 'purchase_history', ?, ?)`,
        [
          `AUD-${Date.now()}`,
          'USR-SYSTEM',
          createdBy,
          'Admin',
          currentBatchId,
          `Imported ${validRecords.length} purchase records from ${importSource}. ${errors.length} errors.`
        ]
      );
    } catch (e) {
      // audit log error non-blocking
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      imported: validRecords.length,
      failed: errors.length,
      batchId: currentBatchId,
      errors,
      message: `Bulk Purchase Import Completed: ${validRecords.length} transactions imported successfully.`
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Bulk purchase import transaction failed:', error);
    res.status(500).json({
      success: false,
      imported: 0,
      failed: req.body?.purchases?.length || 0,
      error: error.message,
      message: 'Failed to process bulk import transaction. Database changes were safely rolled back.'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// 11. POST create new single purchase history transaction
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const {
      id,
      assetId,
      assetName,
      vendorId,
      vendorName,
      categoryId,
      categoryName,
      subcategoryId,
      subcategoryName,
      itemType,
      purchaseDate,
      purchasePrice,
      quantity,
      invoiceNumber,
      invoiceDate,
      warrantyExpiry,
      notes
    } = req.body;

    if (!assetName || !vendorName || !purchaseDate) {
      return res.status(400).json({ error: 'Asset name, vendor name, and purchase date are required.' });
    }

    const priceNum = parseFloat(purchasePrice) || 0;
    const qtyNum = parseInt(quantity, 10) || 1;

    if (priceNum < 0) {
      return res.status(400).json({ error: 'Purchase price cannot be negative.' });
    }
    if (qtyNum < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    const totalAmount = parseFloat((priceNum * qtyNum).toFixed(2));
    const purchaseId = id || `PUR-${Date.now()}`;
    const generatedAssetId = assetId || `AST-${Date.now()}`;

    // If vendorId is not provided, attempt to look up vendor by name
    let resolvedVendorId = vendorId || null;
    if (!resolvedVendorId && vendorName) {
      const [vRows] = await pool.query('SELECT id FROM vendors WHERE name = ? LIMIT 1', [vendorName]);
      if (vRows.length > 0) resolvedVendorId = vRows[0].id;
    }

    await pool.query(
      `INSERT INTO purchase_history (
        id, assetId, assetName, vendorId, vendorName, categoryId, categoryName,
        subcategoryId, subcategoryName, itemType, purchaseDate, purchasePrice,
        quantity, totalAmount, invoiceNumber, invoiceDate, warrantyExpiry, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        purchaseId,
        generatedAssetId,
        assetName,
        resolvedVendorId,
        vendorName,
        categoryId || null,
        categoryName || 'Furniture',
        subcategoryId || null,
        subcategoryName || 'General',
        itemType || subcategoryName || 'General',
        purchaseDate,
        priceNum,
        qtyNum,
        totalAmount,
        invoiceNumber || '',
        invoiceDate || purchaseDate,
        warrantyExpiry || '',
        notes || ''
      ]
    );

    // If asset exists in assets table, optionally update its cost, supplier, warranty, purchaseDate
    if (assetId) {
      try {
        await pool.query(
          `UPDATE assets 
           SET cost = ?, supplier = ?, purchaseDate = ?, warranty = COALESCE(NULLIF(?, ''), warranty)
           WHERE id = ?`,
          [priceNum, vendorName, purchaseDate, warrantyExpiry || '', assetId]
        );
      } catch {
        // Ignore if asset is not in assets table yet
      }
    }

    const [rows] = await pool.query('SELECT * FROM purchase_history WHERE id = ?', [purchaseId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. PUT update existing purchase transaction
router.put('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const {
      assetId,
      assetName,
      vendorId,
      vendorName,
      categoryId,
      categoryName,
      subcategoryId,
      subcategoryName,
      itemType,
      purchaseDate,
      purchasePrice,
      quantity,
      invoiceNumber,
      invoiceDate,
      warrantyExpiry,
      notes
    } = req.body;

    const priceNum = parseFloat(purchasePrice) || 0;
    const qtyNum = parseInt(quantity, 10) || 1;

    if (priceNum < 0) {
      return res.status(400).json({ error: 'Purchase price cannot be negative.' });
    }
    if (qtyNum < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    const totalAmount = parseFloat((priceNum * qtyNum).toFixed(2));

    await pool.query(
      `UPDATE purchase_history SET
        assetId = COALESCE(?, assetId),
        assetName = COALESCE(?, assetName),
        vendorId = COALESCE(?, vendorId),
        vendorName = COALESCE(?, vendorName),
        categoryId = COALESCE(?, categoryId),
        categoryName = COALESCE(?, categoryName),
        subcategoryId = COALESCE(?, subcategoryId),
        subcategoryName = COALESCE(?, subcategoryName),
        itemType = COALESCE(?, itemType),
        purchaseDate = COALESCE(?, purchaseDate),
        purchasePrice = ?,
        quantity = ?,
        totalAmount = ?,
        invoiceNumber = ?,
        invoiceDate = ?,
        warrantyExpiry = ?,
        notes = ?
      WHERE id = ?`,
      [
        assetId,
        assetName,
        vendorId,
        vendorName,
        categoryId,
        categoryName,
        subcategoryId,
        subcategoryName,
        itemType,
        purchaseDate,
        priceNum,
        qtyNum,
        totalAmount,
        invoiceNumber || '',
        invoiceDate || purchaseDate,
        warrantyExpiry || '',
        notes || '',
        req.params.id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM purchase_history WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Purchase transaction not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. DELETE purchase transaction
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM purchase_history WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Purchase transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
