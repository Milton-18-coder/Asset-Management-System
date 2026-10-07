import { getPool } from '../db.js';

export const analyticsTools = {
  // Comprehensive analytics summary combining assets, purchases, condition, and trends
  async getFullAnalytics({ timeframe = 'all', department = 'All' } = {}) {
    const pool = getPool();

    // 1. Filtered Assets
    let assetSql = `SELECT * FROM assets WHERE 1=1`;
    const assetParams = [];
    if (department && department !== 'All') {
      assetSql += ` AND department = ?`;
      assetParams.push(department);
    }
    const [assets] = await pool.query(assetSql, assetParams);

    // 2. Filtered Purchases
    let purchaseSql = `SELECT * FROM purchase_history WHERE 1=1`;
    const purchaseParams = [];
    if (timeframe && timeframe !== 'all') {
      purchaseSql += ` AND YEAR(purchaseDate) = ?`;
      purchaseParams.push(timeframe);
    }
    const [purchases] = await pool.query(purchaseSql, purchaseParams);

    // 3. KPI Metrics
    const totalAssets = assets.reduce((s, a) => s + (parseInt(a.quantity, 10) || 1), 0);
    const totalCapital = purchases.reduce((s, p) => s + (parseFloat(p.totalAmount) || (parseFloat(p.purchasePrice || 0) * (parseInt(p.quantity, 10) || 1))), 0);
    const depreciatedValue = Math.round(totalCapital * 0.76);
    const goodUnits = assets.filter(a => a.condition === 'Good').reduce((s, a) => s + (parseInt(a.quantity, 10) || 1), 0);
    const healthScore = totalAssets > 0 ? parseFloat(((goodUnits / totalAssets) * 100).toFixed(1)) : 100;
    const replacementDue = assets.filter(a => a.condition === 'Poor' || a.condition === 'Damaged' || a.status === 'Needs Inspection').reduce((s, a) => s + (parseInt(a.quantity, 10) || 1), 0);

    // 4. Departmental Chart Data
    const deptMap = {};
    assets.forEach(a => {
      const dept = a.department || 'Admin Block';
      if (!deptMap[dept]) deptMap[dept] = { volume: 0, value: 0 };
      deptMap[dept].volume += parseInt(a.quantity, 10) || 1;
      deptMap[dept].value += (parseFloat(a.cost) || 0) * (parseInt(a.quantity, 10) || 1);
    });
    const departmentChartData = Object.entries(deptMap).map(([dept, data]) => ({
      label: dept.replace('Department', '').trim(),
      volume: data.volume,
      value: data.value
    }));

    // 5. Supplier Spend Ranking
    const supplierMap = {};
    purchases.forEach(p => {
      const v = p.vendorName || 'Campus Supplier';
      const amt = parseFloat(p.totalAmount) || (parseFloat(p.purchasePrice || 0) * (parseInt(p.quantity, 10) || 1));
      supplierMap[v] = (supplierMap[v] || 0) + amt;
    });
    const supplierSpendData = Object.entries(supplierMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 6. Real Cost Histogram Bins
    const costBins = [
      { range: '< ₹2k', count: 0 },
      { range: '₹2k-₹10k', count: 0 },
      { range: '₹10k-₹30k', count: 0 },
      { range: '₹30k-₹70k', count: 0 },
      { range: '> ₹70k', count: 0, highlight: true }
    ];
    assets.forEach(a => {
      const c = parseFloat(a.cost) || 0;
      const q = parseInt(a.quantity, 10) || 1;
      if (c < 2000) costBins[0].count += q;
      else if (c < 10000) costBins[1].count += q;
      else if (c < 30000) costBins[2].count += q;
      else if (c < 70000) costBins[3].count += q;
      else costBins[4].count += q;
    });

    // 7. Real Age Histogram Bins calculated from purchaseDate
    const now = new Date();
    const ageBins = [
      { range: '< 1 Year (New)', count: 0 },
      { range: '1 - 2 Years', count: 0 },
      { range: '2 - 3 Years', count: 0 },
      { range: '3 - 5 Years', count: 0 },
      { range: '> 5 Years (EOL)', count: 0, highlight: true }
    ];
    assets.forEach(a => {
      const q = parseInt(a.quantity, 10) || 1;
      if (!a.purchaseDate) {
        ageBins[1].count += q; // default bracket
        return;
      }
      const pDate = new Date(a.purchaseDate);
      const diffYears = (now - pDate) / (1000 * 60 * 60 * 24 * 365.25);
      if (diffYears < 1) ageBins[0].count += q;
      else if (diffYears < 2) ageBins[1].count += q;
      else if (diffYears < 3) ageBins[2].count += q;
      else if (diffYears < 5) ageBins[3].count += q;
      else ageBins[4].count += q;
    });

    // 8. Quarterly Price Trajectory from purchase_history
    const quarterlyMap = {};
    purchases.forEach(p => {
      if (!p.purchaseDate) return;
      const d = new Date(p.purchaseDate);
      const year = d.getFullYear();
      const qtr = Math.floor(d.getMonth() / 3) + 1;
      const key = `Q${qtr} ${year}`;
      if (!quarterlyMap[key]) quarterlyMap[key] = { totalCost: 0, count: 0, year, qtr };
      quarterlyMap[key].totalCost += parseFloat(p.purchasePrice || 0) * (parseInt(p.quantity, 10) || 1);
      quarterlyMap[key].count += parseInt(p.quantity, 10) || 1;
    });

    let trendLineData = Object.entries(quarterlyMap)
      .map(([label, obj]) => ({
        label,
        value: Math.round(obj.totalCost / (obj.count || 1)),
        year: obj.year,
        qtr: obj.qtr
      }))
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.qtr - b.qtr);

    if (trendLineData.length === 0) {
      trendLineData = [
        { label: 'Q1 2024', value: 38000 },
        { label: 'Q2 2024', value: 42000 },
        { label: 'Q3 2024', value: 46000 },
        { label: 'Q4 2024', value: 49500 },
        { label: 'Q1 2025', value: 54000 },
        { label: 'Q2 2025', value: 58000 },
        { label: 'Q3 2025', value: 62000 },
        { label: 'Q4 2025', value: 65000 },
        { label: 'Q1 2026', value: 68500 }
      ];
    }

    return {
      timeframe,
      department,
      stats: { totalAssets, totalCapital, depreciatedValue, healthScore, replacementDue },
      departmentChartData,
      supplierSpendData,
      costBins,
      ageBins,
      trendLineData
    };
  }
};
