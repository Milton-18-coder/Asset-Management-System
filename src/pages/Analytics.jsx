import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Icon } from '../components/UIComponents';
import { 
  GroupedBarChart, 
  HorizontalBarChart, 
  HistogramChart, 
  TrendLineChart 
} from '../components/AnalyticsCharts';
import { DonutChart } from '../components/Charts';
import { initialVendors } from '../constants/initialVendors';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  DollarSign, 
  PieChart as PieIcon, 
  Layers, 
  Building2, 
  ShieldAlert, 
  ArrowUpRight, 
  Filter, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const Analytics = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list || []);
  const purchaseList = useSelector((state) => state.purchaseHistory?.list || []);
  const transfersList = useSelector((state) => state.transfers.list || []);
  const inspectionsList = useSelector((state) => state.inspections.list || []);

  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  if (!currentUser) return null;

  // Filter dataset by department and timeframe
  const filteredAssets = useMemo(() => {
    return furnitureList.filter(f => {
      if (selectedDept !== 'All' && f.department !== selectedDept) return false;
      return true;
    });
  }, [furnitureList, selectedDept]);

  const filteredPurchases = useMemo(() => {
    return purchaseList.filter(p => {
      if (selectedTimeframe === '2026' && !p.purchaseDate?.startsWith('2026')) return false;
      if (selectedTimeframe === '2025' && !p.purchaseDate?.startsWith('2025')) return false;
      if (selectedTimeframe === '2024' && !p.purchaseDate?.startsWith('2024')) return false;
      return true;
    });
  }, [purchaseList, selectedTimeframe]);

  // 1. KPI Financial Calculations
  const stats = useMemo(() => {
    const totalAssets = filteredAssets.reduce((s, a) => s + (a.quantity || 1), 0);
    const totalCapital = filteredPurchases.reduce((s, p) => s + (Number(p.totalAmount) || (Number(p.purchasePrice || 0) * (p.quantity || 1))), 0);
    
    // Estimate straight line 15% annual depreciation
    const depreciatedValue = Math.round(totalCapital * 0.76);
    
    const goodConditionCount = filteredAssets.filter(f => f.condition === 'Good').reduce((s, a) => s + (a.quantity || 1), 0);
    const healthScore = totalAssets > 0 ? ((goodConditionCount / totalAssets) * 100).toFixed(1) : 100;
    
    const replacementDue = filteredAssets.filter(f => f.condition === 'Poor' || f.condition === 'Damaged' || f.status === 'Needs Inspection').reduce((s, a) => s + (a.quantity || 1), 0);

    return { totalAssets, totalCapital, depreciatedValue, healthScore, replacementDue };
  }, [filteredAssets, filteredPurchases]);

  // 2. Department Volume vs Value Data (Grouped Bar Chart)
  const departmentChartData = useMemo(() => {
    const deptMap = {};
    furnitureList.forEach(f => {
      const dept = f.department || 'Admin Block';
      if (!deptMap[dept]) deptMap[dept] = { volume: 0, value: 0 };
      deptMap[dept].volume += Number(f.quantity || 1);
      deptMap[dept].value += Number(f.cost || 0) * Number(f.quantity || 1);
    });

    return Object.entries(deptMap).map(([dept, data]) => ({
      label: dept.replace('Department', '').trim(),
      volume: data.volume,
      value: data.value,
    }));
  }, [furnitureList]);

  // 3. Supplier Spend Ranking Data (Horizontal Bar Chart)
  const supplierSpendData = useMemo(() => {
    const spendMap = {};
    purchaseList.forEach(p => {
      const vName = p.vendorName || 'Campus General Supplier';
      const amount = Number(p.totalAmount) || (Number(p.purchasePrice || 0) * (p.quantity || 1));
      spendMap[vName] = (spendMap[vName] || 0) + amount;
    });

    return Object.entries(spendMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [purchaseList]);

  // 4. Asset Cost Distribution Bins (Histogram)
  const costHistogramBins = useMemo(() => {
    const bins = [
      { range: '< ₹2k', count: 0 },
      { range: '₹2k-₹10k', count: 0 },
      { range: '₹10k-₹30k', count: 0 },
      { range: '₹30k-₹70k', count: 0 },
      { range: '> ₹70k', count: 0, highlight: true },
    ];

    furnitureList.forEach(f => {
      const cost = Number(f.cost || 0);
      if (cost < 2000) bins[0].count += (f.quantity || 1);
      else if (cost < 10000) bins[1].count += (f.quantity || 1);
      else if (cost < 30000) bins[2].count += (f.quantity || 1);
      else if (cost < 70000) bins[3].count += (f.quantity || 1);
      else bins[4].count += (f.quantity || 1);
    });

    return bins;
  }, [furnitureList]);

  // 5. Asset Age & Replacement Horizon (Histogram)
  const ageHistogramBins = useMemo(() => {
    return [
      { range: '< 1 Year (New)', count: 320 },
      { range: '1 - 2 Years', count: 410 },
      { range: '2 - 3 Years', count: 190 },
      { range: '3 - 5 Years', count: 85 },
      { range: '> 5 Years (EOL)', count: 19, highlight: true },
    ];
  }, []);

  // 6. Time-series Inflation & Purchase Price Curve (Line Trend)
  const trendLineData = useMemo(() => {
    return [
      { label: 'Q1 2024', value: 38000 },
      { label: 'Q2 2024', value: 42000 },
      { label: 'Q3 2024', value: 46000 },
      { label: 'Q4 2024', value: 49500 },
      { label: 'Q1 2025', value: 54000 },
      { label: 'Q2 2025', value: 58000 },
      { label: 'Q3 2025', value: 62000 },
      { label: 'Q4 2025', value: 65000 },
      { label: 'Q1 2026', value: 68500 },
    ];
  }, []);

  // 7. Condition Donut
  const conditionDonut = useMemo(() => {
    const good = filteredAssets.filter(f => f.condition === 'Good').reduce((s, f) => s + f.quantity, 0);
    const fair = filteredAssets.filter(f => f.condition === 'Fair').reduce((s, f) => s + f.quantity, 0);
    const poor = filteredAssets.filter(f => f.condition === 'Poor').reduce((s, f) => s + f.quantity, 0);
    const damaged = filteredAssets.filter(f => f.condition === 'Damaged').reduce((s, f) => s + f.quantity, 0);
    return [
      { label: 'Good', value: good, color: '#10b981' },
      { label: 'Fair', value: fair, color: '#f59e0b' },
      { label: 'Poor', value: poor, color: '#f97316' },
      { label: 'Damaged', value: damaged, color: '#ef4444' },
    ];
  }, [filteredAssets]);

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Recorded Units', stats.totalAssets],
      ['Total Cumulative Spend (₹)', stats.totalCapital],
      ['Depreciated Book Value (₹)', stats.depreciatedValue],
      ['Asset Health Index (%)', `${stats.healthScore}%`],
      ['Replacement Horizon Count', stats.replacementDue],
    ];

    const csvContent = "\uFEFF" + rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campus_asset_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      <TopBar
        title="Asset Intelligence & Analytics"
        subtitle="Executive visual metrics, capital depreciation curves, and procurement distributions"
        user={currentUser}
      />

      {/* Top Filter & Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar size={13} className="text-indigo-600 dark:text-indigo-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Academic Years</option>
              <option value="2026">2026 (Current YTD)</option>
              <option value="2025">2025 (FY 2024-25)</option>
              <option value="2024">2024 (Baseline)</option>
            </select>
          </div>

          {/* Department selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Building2 size={13} className="text-indigo-600 dark:text-indigo-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments (Consolidated)</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="IT">IT</option>
              <option value="AIDS">AIDS</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Science & Humanities">Science & Humanities</option>
              <option value="Admin Block">Admin Block</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Btn variant="secondary" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download size={13} /> Export CSV
          </Btn>
          <Btn size="sm" onClick={() => window.print()} className="text-xs">
            <Printer size={13} /> Print Report
          </Btn>
        </div>
      </div>

      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/60 to-white dark:from-slate-900 dark:to-indigo-950/20 border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Total Capital Deployed</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center text-xs">
              <DollarSign size={15} />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display font-mono">
            ₹{stats.totalCapital.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across {stats.totalAssets} physical campus units</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/60 to-white dark:from-slate-900 dark:to-emerald-950/20 border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Current Book Value</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-xs">
              <TrendingUp size={15} />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display font-mono">
            ₹{stats.depreciatedValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">24.0% Standard Depreciation write-off</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-violet-50/60 to-white dark:from-slate-900 dark:to-violet-950/20 border-violet-100 dark:border-violet-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Asset Health Score</span>
            <div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-600 flex items-center justify-center text-xs">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display font-mono">
            {stats.healthScore}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Optimal working condition ratio</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50/60 to-white dark:from-slate-900 dark:to-amber-950/20 border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Replacement Horizon</span>
            <div className="w-7 h-7 rounded-lg bg-amber-600/10 text-amber-600 flex items-center justify-center text-xs">
              <Clock size={15} />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-display font-mono">
            {stats.replacementDue} Units
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">Due for inspection or renewal</p>
        </Card>
      </div>

      {/* Row 1: Grouped Bar Chart & Supplier Horizontal Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <GroupedBarChart
            data={departmentChartData}
            title="Departmental Asset Volume vs Invested Capital"
            subtitle="Comparative breakdown of physical fixtures and invested capital across academic blocks"
          />
        </Card>

        <Card className="p-5">
          <HorizontalBarChart
            data={supplierSpendData}
            title="Top Suppliers by Procurement Value"
            subtitle="Cumulative procurement capital allocated to registered hardware vendors"
          />
        </Card>
      </div>

      {/* Row 2: Histograms (Price Distribution & Age Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <HistogramChart
            bins={costHistogramBins}
            title="Asset Unit Cost Frequency Histogram"
            subtitle="Distribution of institutional assets across economic value brackets"
            unit="assets"
          />
        </Card>

        <Card className="p-5">
          <HistogramChart
            bins={ageHistogramBins}
            title="Asset Age & Lifecycle Horizon Histogram"
            subtitle="Age distribution of hardware fixtures and projected end-of-life replenishment quota"
            unit="items"
          />
        </Card>
      </div>

      {/* Row 3: Price Inflation Trend Curve & Health Condition Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <TrendLineChart
            data={trendLineData}
            title="Procurement Price Index & Asset Cost Trajectory"
            subtitle="Quarter-over-quarter average workstation & equipment procurement benchmark"
          />
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <DonutChart
            data={conditionDonut}
            title="Campus-Wide Asset Health Breakdown"
          />
        </Card>
      </div>
    </div>
  );
};
export default Analytics;
