import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Select, Badge } from '../components/UIComponents';
import { AssetPriceHistoryModal } from '../components/AssetPriceHistoryModal';
import { VendorPurchaseHistoryModal } from '../components/VendorPurchaseHistoryModal';
import { PriceHistoryChart } from '../components/PriceHistoryChart';
import { api } from '../api';
import {
  addPurchaseHistoryRecord,
  setPurchaseHistoryList,
  setPurchaseHistoryStats
} from '../store/purchaseHistorySlice';
import { updateFurniture } from '../store/furnitureSlice';
import {
  ShoppingBag,
  Calendar,
  Layers,
  Store,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  SlidersHorizontal,
  FileText,
  Package,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  Filter,
  ArrowUpDown,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

export const Purchases = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const purchaseList = useSelector((state) => state.purchaseHistory?.list || []);
  const assetsList = useSelector((state) => state.furniture?.list || []);
  const vendorsList = useSelector((state) => state.furniture?.vendors || []);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'category' | 'vendors' | 'price-tracker'
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Primary Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('purchaseDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Category analysis tab state
  const [analysisCategory, setAnalysisCategory] = useState('Furniture');
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);

  // Modals state
  const [selectedAssetForModal, setSelectedAssetForModal] = useState(null);
  const [selectedVendorForModal, setSelectedVendorForModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Purchase Transaction Form State
  const [newPurchaseForm, setNewPurchaseForm] = useState({
    assetId: '',
    assetName: '',
    vendorName: '',
    vendorId: '',
    categoryName: 'Furniture',
    subcategoryName: 'Chair',
    itemType: 'Task Chair',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    quantity: 1,
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: '3 Years Standard',
    notes: '',
  });

  // Sync purchase history from backend
  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await api.getPurchaseHistory();
      if (Array.isArray(data) && data.length > 0) {
        dispatch(setPurchaseHistoryList(data));
      }
    } catch (err) {
      console.warn('Backend purchase history fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  // Filter options
  const uniqueCategories = useMemo(() => {
    const cats = new Set(purchaseList.map((p) => p.categoryName).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [purchaseList]);

  const uniqueSubCategories = useMemo(() => {
    let list = purchaseList;
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.categoryName === selectedCategory);
    }
    const subs = new Set(list.map((p) => p.subcategoryName).filter(Boolean));
    return ['All', ...Array.from(subs)];
  }, [purchaseList, selectedCategory]);

  const uniqueVendors = useMemo(() => {
    const vSet = new Set(purchaseList.map((p) => p.vendorName).filter(Boolean));
    return ['All', ...Array.from(vSet)];
  }, [purchaseList]);

  // Filtered Purchases Table
  const filteredPurchases = useMemo(() => {
    return purchaseList
      .filter((p) => {
        if (fromDate && new Date(p.purchaseDate) < new Date(fromDate)) return false;
        if (toDate && new Date(p.purchaseDate) > new Date(toDate)) return false;
        if (selectedCategory !== 'All' && p.categoryName !== selectedCategory) return false;
        if (selectedSubCategory !== 'All' && p.subcategoryName !== selectedSubCategory) return false;
        if (selectedVendor !== 'All' && p.vendorName !== selectedVendor) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.assetName?.toLowerCase().includes(q);
          const matchId = p.assetId?.toLowerCase().includes(q);
          const matchVendor = p.vendorName?.toLowerCase().includes(q);
          const matchInv = p.invoiceNumber?.toLowerCase().includes(q);
          const matchNotes = p.notes?.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchVendor && !matchInv && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'purchasePrice' || sortField === 'totalAmount' || sortField === 'quantity') {
          valA = Number(valA || 0);
          valB = Number(valB || 0);
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [purchaseList, fromDate, toDate, selectedCategory, selectedSubCategory, selectedVendor, searchQuery, sortField, sortAsc]);

  // Overall KPIs
  const totalExpenditure = filteredPurchases.reduce((s, p) => s + Number(p.totalAmount || p.purchasePrice * (p.quantity || 1)), 0);
  const totalUnits = filteredPurchases.reduce((s, p) => s + Number(p.quantity || 1), 0);
  const averageUnitPrice = totalUnits > 0 ? totalExpenditure / totalUnits : 0;
  const activeVendorsCount = new Set(filteredPurchases.map((p) => p.vendorName)).size;

  // Quick Date Preset Handler
  const handleDatePreset = (preset) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    if (preset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (preset === '2026') {
      setFromDate('2026-01-01');
      setToDate('2026-12-31');
    } else if (preset === '2025') {
      setFromDate('2025-01-01');
      setToDate('2025-12-31');
    } else if (preset === '2024') {
      setFromDate('2024-01-01');
      setToDate('2024-12-31');
    } else if (preset === 'q1-2026') {
      setFromDate('2026-01-01');
      setToDate('2026-03-31');
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(`${y}-${m}-${d}`);
    }
  };

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredPurchases.length === 0) return;
    const headers = ['Purchase ID', 'Asset ID', 'Asset Name', 'Vendor', 'Category', 'Subcategory', 'Purchase Date', 'Unit Price (INR)', 'Quantity', 'Total Amount (INR)', 'Invoice Number', 'Warranty', 'Notes'];
    const rows = filteredPurchases.map((p) => [
      p.id,
      p.assetId,
      `"${p.assetName.replace(/"/g, '""')}"`,
      `"${p.vendorName.replace(/"/g, '""')}"`,
      p.categoryName,
      p.subcategoryName,
      p.purchaseDate,
      p.purchasePrice,
      p.quantity,
      p.totalAmount || p.purchasePrice * p.quantity,
      `"${p.invoiceNumber || ''}"`,
      `"${p.warrantyExpiry || ''}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_history_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save new purchase transaction
  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (!newPurchaseForm.assetName || !newPurchaseForm.vendorName || !newPurchaseForm.purchaseDate) return;

    const priceNum = parseFloat(newPurchaseForm.purchasePrice) || 0;
    const qtyNum = parseInt(newPurchaseForm.quantity, 10) || 1;
    const totalAmount = parseFloat((priceNum * qtyNum).toFixed(2));

    const payload = {
      id: `PUR-${Date.now()}`,
      assetId: newPurchaseForm.assetId || `AST-${Date.now().toString().slice(-4)}`,
      assetName: newPurchaseForm.assetName.trim(),
      vendorId: newPurchaseForm.vendorId || null,
      vendorName: newPurchaseForm.vendorName.trim(),
      categoryId: 'CAT-001',
      categoryName: newPurchaseForm.categoryName,
      subcategoryId: 'SUB-001',
      subcategoryName: newPurchaseForm.subcategoryName,
      itemType: newPurchaseForm.itemType || newPurchaseForm.subcategoryName,
      purchaseDate: newPurchaseForm.purchaseDate,
      purchasePrice: priceNum,
      quantity: qtyNum,
      totalAmount,
      invoiceNumber: newPurchaseForm.invoiceNumber.trim(),
      invoiceDate: newPurchaseForm.invoiceDate || newPurchaseForm.purchaseDate,
      warrantyExpiry: newPurchaseForm.warrantyExpiry.trim(),
      notes: newPurchaseForm.notes.trim(),
    };

    try {
      let saved = payload;
      try {
        saved = await api.addPurchaseHistory(payload);
      } catch {
        // Fallback
      }
      dispatch(addPurchaseHistoryRecord(saved));

      // Find if matching asset exists and update quantity & latest cost
      const match = assetsList.find((a) => a.id === payload.assetId || a.name === payload.assetName);
      if (match) {
        dispatch(
          updateFurniture({
            ...match,
            cost: priceNum,
            supplier: payload.vendorName,
            purchaseDate: payload.purchaseDate,
            quantity: (match.quantity || 1) + qtyNum,
          })
        );
      }

      setSuccessToast(`Purchase transaction for "${payload.assetName}" (₹${totalAmount.toLocaleString()}) saved successfully!`);
      setShowAddModal(false);
      setNewPurchaseForm({
        assetId: '',
        assetName: '',
        vendorName: '',
        vendorId: '',
        categoryName: 'Furniture',
        subcategoryName: 'Chair',
        itemType: 'Task Chair',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: '',
        quantity: 1,
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        warrantyExpiry: '3 Years Standard',
        notes: '',
      });
    } catch (err) {
      alert('Failed to save purchase: ' + err.message);
    }
  };

  // Grouped data for Category Analysis Tab
  const categoryAnalysisData = useMemo(() => {
    const catPurchases = purchaseList.filter(
      (p) => p.categoryName === analysisCategory || (!p.categoryName && analysisCategory === 'Furniture')
    );

    const subMap = {};
    for (const p of catPurchases) {
      const sub = p.subcategoryName || 'General';
      if (!subMap[sub]) {
        subMap[sub] = {
          name: sub,
          totalSpent: 0,
          totalUnits: 0,
          transactions: [],
          vendors: new Set(),
          prices: []
        };
      }
      subMap[sub].totalSpent += Number(p.totalAmount || p.purchasePrice * (p.quantity || 1));
      subMap[sub].totalUnits += Number(p.quantity || 1);
      subMap[sub].transactions.push(p);
      subMap[sub].vendors.add(p.vendorName);
      subMap[sub].prices.push(Number(p.purchasePrice || 0));
    }

    return Object.values(subMap).map((s) => ({
      ...s,
      averagePrice: s.totalUnits > 0 ? s.totalSpent / s.totalUnits : 0,
      minPrice: Math.min(...s.prices),
      maxPrice: Math.max(...s.prices),
      vendorCount: s.vendors.size,
      vendorsList: Array.from(s.vendors)
    }));
  }, [purchaseList, analysisCategory]);

  // Grouped data for Vendor Procurement Tab
  const vendorProcurementData = useMemo(() => {
    const vMap = {};
    for (const p of purchaseList) {
      const v = p.vendorName || 'Unassigned Vendor';
      if (!vMap[v]) {
        vMap[v] = {
          name: v,
          vendorId: p.vendorId,
          totalSpent: 0,
          totalUnits: 0,
          transactions: [],
          categories: new Set(),
          products: new Set(),
          dates: []
        };
      }
      vMap[v].totalSpent += Number(p.totalAmount || p.purchasePrice * (p.quantity || 1));
      vMap[v].totalUnits += Number(p.quantity || 1);
      vMap[v].transactions.push(p);
      vMap[v].categories.add(p.categoryName);
      vMap[v].products.add(p.assetName);
      vMap[v].dates.push(p.purchaseDate);
    }

    return Object.values(vMap).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [purchaseList]);

  // Grouped data for Asset Price Fluctuation Tracker
  const assetPriceTrackerData = useMemo(() => {
    const aMap = {};
    for (const p of purchaseList) {
      const aName = p.assetName || p.assetId;
      if (!aMap[aName]) {
        aMap[aName] = {
          name: aName,
          assetId: p.assetId,
          category: p.categoryName,
          subcategory: p.subcategoryName,
          purchases: []
        };
      }
      aMap[aName].purchases.push(p);
    }

    return Object.values(aMap).map((a) => {
      const sorted = [...a.purchases].sort((p1, p2) => new Date(p1.purchaseDate) - new Date(p2.purchaseDate));
      const prices = sorted.map((p) => Number(p.purchasePrice || 0));
      const totalUnits = sorted.reduce((s, p) => s + Number(p.quantity || 1), 0);
      const totalSpent = sorted.reduce((s, p) => s + Number(p.totalAmount || p.purchasePrice * (p.quantity || 1)), 0);
      const first = sorted[0];
      const latest = sorted[sorted.length - 1];
      const diff = Number(latest.purchasePrice) - Number(first.purchasePrice);
      const pctChange = Number(first.purchasePrice) > 0 ? ((diff / Number(first.purchasePrice)) * 100).toFixed(1) : 0;

      return {
        ...a,
        totalUnits,
        totalSpent,
        transactionCount: sorted.length,
        initialPrice: Number(first.purchasePrice),
        initialDate: first.purchaseDate,
        initialVendor: first.vendorName,
        latestPrice: Number(latest.purchasePrice),
        latestDate: latest.purchaseDate,
        latestVendor: latest.vendorName,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        avgPrice: totalUnits > 0 ? totalSpent / totalUnits : 0,
        pctChange: parseFloat(pctChange),
        historyForChart: sorted.map((p) => ({
          date: p.purchaseDate,
          price: Number(p.purchasePrice),
          vendor: p.vendorName,
          quantity: p.quantity
        }))
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [purchaseList]);

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* 1. Header and Actions */}
      <TopBar
        title="Vendor–Asset Purchase History & Price Tracking"
        subtitle="Historical procurement transactions, price fluctuation intelligence, and supplier expenditure tracking"
        user={currentUser}
      />

      {/* Toast Notification */}
      {successToast && (
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm rounded-2xl px-4 py-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Top-Level KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spend</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono leading-tight mt-0.5">
              ₹{totalExpenditure.toLocaleString()}
            </h3>
            <span className="text-xs text-slate-500">{filteredPurchases.length} transactions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Units Acquired</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-tight mt-0.5">
              {totalUnits} Units
            </h3>
            <span className="text-xs text-slate-500">Across campus inventory</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Suppliers</p>
            <h3 className="text-xl sm:text-2xl font-black text-violet-600 dark:text-violet-400 font-mono leading-tight mt-0.5">
              {activeVendorsCount} Vendors
            </h3>
            <span className="text-xs text-slate-500">Registered commercial partners</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Unit Cost</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono leading-tight mt-0.5">
              ₹{Math.round(averageUnitPrice).toLocaleString()}
            </h3>
            <span className="text-xs text-slate-500">Weighted average price</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Mode Switcher Ribbon */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Date Range & All Purchases</span>
          </button>

          <button
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'category'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Category & Subcategory Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'vendors'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Vendor Expenditure</span>
          </button>

          <button
            onClick={() => setActiveTab('price-tracker')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'price-tracker'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Price Fluctuation Tracker</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <Btn variant="secondary" onClick={handleExportCSV} className="!py-2 !px-3.5 text-xs font-bold">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Btn>
          <Btn onClick={() => setShowAddModal(true)} className="!py-2 !px-3.5 text-xs font-bold">
            <Plus className="w-4 h-4 mr-1" /> Record Purchase
          </Btn>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DATE RANGE & ALL PURCHASES (MAIN VIEW)
         ========================================================================= */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Powerful Filter Bar with Date Range Presets */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            {/* Quick Date Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
                Quick Range:
              </span>
              {[
                ['all', 'All Time'],
                ['30days', 'Last 30 Days'],
                ['q1-2026', 'Q1 2026'],
                ['2026', 'Year 2026'],
                ['2025', 'Year 2025'],
                ['2024', 'Year 2024'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleDatePreset(key)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Asset Name, ID, Vendor, Invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* From Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory('All');
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  {uniqueCategories.map((c) => (
                    <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Supplier / Vendor
                </label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  {uniqueVendors.map((v) => (
                    <option key={v} value={v}>{v === 'All' ? 'All Vendors' : v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Pill Bar */}
            {(fromDate || toDate || selectedCategory !== 'All' || selectedSubCategory !== 'All' || selectedVendor !== 'All' || searchQuery) && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Showing <strong>{filteredPurchases.length}</strong> of {purchaseList.length} transactions · Total: <strong className="text-indigo-600 dark:text-indigo-400">₹{totalExpenditure.toLocaleString()}</strong>
                </span>
                <button
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setSelectedCategory('All');
                    setSelectedSubCategory('All');
                    setSelectedVendor('All');
                    setSearchQuery('');
                  }}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* Master Purchases Data Table */}
          {filteredPurchases.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">No Purchase Records Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No purchase transactions match your specified date range or filter criteria. Try expanding your search or date bounds.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-4 py-3.5 cursor-pointer hover:text-slate-700" onClick={() => handleSort('assetName')}>
                        <div className="flex items-center gap-1">
                          <span>Asset & Product</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Taxonomy</th>
                      <th className="px-3 py-3.5 cursor-pointer hover:text-slate-700" onClick={() => handleSort('vendorName')}>
                        <div className="flex items-center gap-1">
                          <span>Supplier / Vendor</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="px-3 py-3.5 whitespace-nowrap cursor-pointer hover:text-slate-700" onClick={() => handleSort('purchaseDate')}>
                        <div className="flex items-center gap-1">
                          <span>Purchase Date</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="px-3 py-3.5 text-right whitespace-nowrap cursor-pointer hover:text-slate-700" onClick={() => handleSort('purchasePrice')}>
                        <div className="flex items-center justify-end gap-1">
                          <span>Unit Price</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="px-3 py-3.5 text-center whitespace-nowrap cursor-pointer hover:text-slate-700" onClick={() => handleSort('quantity')}>
                        <div className="flex items-center justify-center gap-1">
                          <span>Qty</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="px-4 py-3.5 text-right whitespace-nowrap cursor-pointer hover:text-slate-700" onClick={() => handleSort('totalAmount')}>
                        <div className="flex items-center justify-end gap-1">
                          <span>Total (₹)</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th className="px-3 py-3.5 whitespace-nowrap">Invoice #</th>
                      <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        {/* Asset Name (Clickable to open price history modal) */}
                        <td className="px-4 py-3 min-w-[200px]">
                          <button
                            onClick={() => setSelectedAssetForModal({ id: p.assetId, name: p.assetName })}
                            className="text-left font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer group"
                            title="Click to view full price tracking & history"
                          >
                            <span>{p.assetName}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity flex-shrink-0" />
                          </button>
                          <span className="font-mono text-xs text-slate-400 block">{p.assetId}</span>
                        </td>

                        {/* Category & Subcategory */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">{p.categoryName}</span>
                          <span className="text-[11px] text-slate-400">{p.subcategoryName}</span>
                        </td>

                        {/* Vendor Name (Clickable to open vendor history modal) */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedVendorForModal({ id: p.vendorId, name: p.vendorName })}
                            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                            title="View all purchases from this vendor"
                          >
                            <Store className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{p.vendorName}</span>
                          </button>
                        </td>

                        {/* Purchase Date */}
                        <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200 text-xs">
                          {p.purchaseDate}
                        </td>

                        {/* Unit Price */}
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap text-xs sm:text-sm">
                          ₹{Number(p.purchasePrice || 0).toLocaleString()}
                        </td>

                        {/* Quantity */}
                        <td className="px-3 py-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                          {p.quantity || 1}
                        </td>

                        {/* Total Amount */}
                        <td className="px-4 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-xs sm:text-sm">
                          ₹{Number(p.totalAmount || p.purchasePrice * (p.quantity || 1)).toLocaleString()}
                        </td>

                        {/* Invoice Number */}
                        <td className="px-3 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {p.invoiceNumber || '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedAssetForModal({ id: p.assetId, name: p.assetName })}
                            className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                          >
                            Track Price
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CATEGORY & SUBCATEGORY ANALYSIS
         ========================================================================= */}
      {activeTab === 'category' && (
        <div className="space-y-4">
          {/* Category Select Pills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              Select Category:
            </span>
            {['Furniture', 'Electronics', 'Laboratory', 'IT Hardware'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setAnalysisCategory(cat);
                  setExpandedSubcategory(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  analysisCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Subcategories Breakdown Accordions */}
          <div className="space-y-3">
            {categoryAnalysisData.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
                <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">No Procurement Records in {analysisCategory}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No purchases recorded yet for {analysisCategory}. Click "Record Purchase" above to log a new invoice transaction.
                </p>
              </div>
            ) : (
              categoryAnalysisData.map((sub) => {
              const isExpanded = expandedSubcategory === sub.name;

              return (
                <div
                  key={sub.name}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  {/* Subcategory Summary Header */}
                  <div
                    onClick={() => setExpandedSubcategory(isExpanded ? null : sub.name)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
                        {sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white font-display">
                            {sub.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            {sub.transactions.length} purchases
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Supplied by: <span className="text-slate-700 dark:text-slate-300 font-medium">{sub.vendorsList.join(', ')}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto flex-wrap">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expenditure</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          ₹{sub.totalSpent.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Units Acquired</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white font-mono">
                          {sub.totalUnits} units
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Price</span>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                          ₹{Math.round(sub.averagePrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Subcategory Transactions Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-4">
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap bg-slate-50 dark:bg-slate-800/50">
                              <th className="px-4 py-2.5">Asset / Product</th>
                              <th className="px-3 py-2.5">Vendor</th>
                              <th className="px-3 py-2.5">Purchase Date</th>
                              <th className="px-3 py-2.5 text-right">Unit Price</th>
                              <th className="px-3 py-2.5 text-center">Qty</th>
                              <th className="px-4 py-2.5 text-right">Total</th>
                              <th className="px-3 py-2.5">Invoice</th>
                              <th className="px-3 py-2.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sub.transactions.map((t) => (
                              <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                                  {t.assetName}
                                  <span className="font-mono text-[10px] text-slate-400 block">{t.assetId}</span>
                                </td>
                                <td className="px-3 py-2.5 text-indigo-600 dark:text-indigo-400 font-semibold">{t.vendorName}</td>
                                <td className="px-3 py-2.5">{t.purchaseDate}</td>
                                <td className="px-3 py-2.5 text-right font-mono font-bold">₹{Number(t.purchasePrice).toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-center font-mono">{t.quantity}</td>
                                <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  ₹{Number(t.totalAmount || t.purchasePrice * t.quantity).toLocaleString()}
                                </td>
                                <td className="px-3 py-2.5 font-mono text-slate-400">{t.invoiceNumber || '—'}</td>
                                <td className="px-3 py-2.5 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAssetForModal({ id: t.assetId, name: t.assetName });
                                    }}
                                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                  >
                                    View History
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: VENDOR EXPENDITURE INTELLIGENCE
         ========================================================================= */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorProcurementData.map((v) => (
            <Card
              key={v.name}
              className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base font-display">{v.name}</h4>
                      <p className="text-xs text-slate-400">{v.transactions.length} orders logged</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2 text-xs mb-3 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Purchase Value:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">₹{v.totalSpent.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Units Supplied:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{v.totalUnits} units</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Unique Products:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{v.products.size} items</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplied Categories</span>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(v.categories).map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                <Btn
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-xs font-bold"
                  onClick={() => setSelectedVendorForModal({ id: v.vendorId, name: v.name })}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> View Vendor Purchase History
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* =========================================================================
          TAB 4: PRICE FLUCTUATION TRACKER (ASSET MULTI-PURCHASE INTELLIGENCE)
         ========================================================================= */}
      {activeTab === 'price-tracker' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Asset Price Fluctuation & Multi-Batch Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Track how acquisition unit costs evolved across different dates and vendors without losing historical transaction integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assetPriceTrackerData.map((asset) => (
              <Card key={asset.name} className="p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {asset.category} › {asset.subcategory}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white font-display">
                        {asset.name}
                      </h4>
                      <span className="font-mono text-xs text-slate-400">{asset.assetId}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                        asset.pctChange > 0
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                          : asset.pctChange < 0
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {asset.pctChange > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : asset.pctChange < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                      {asset.pctChange > 0 ? `+${asset.pctChange}%` : `${asset.pctChange}%`}
                    </span>
                  </div>

                  {/* Price Timeline Comparison */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 mb-3 text-xs border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Initial Price ({asset.initialDate})</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-sm">
                        ₹{asset.initialPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{asset.initialVendor}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Latest Price ({asset.latestDate})</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                        ₹{asset.latestPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{asset.latestVendor}</span>
                    </div>
                  </div>

                  {/* Mini Price History Chart */}
                  {asset.historyForChart.length > 1 && (
                    <div className="mb-3">
                      <PriceHistoryChart data={asset.historyForChart} height={120} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Total: <strong className="text-slate-800 dark:text-slate-200 font-mono">{asset.totalUnits} units</strong> (₹{asset.totalSpent.toLocaleString()})
                  </span>
                  <button
                    onClick={() => setSelectedAssetForModal({ id: asset.assetId, name: asset.name })}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Full Transaction History</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: RECORD NEW PURCHASE TRANSACTION
         ========================================================================= */}
      {showAddModal && (
        <Modal
          title="Record New Asset Purchase Transaction"
          onClose={() => setShowAddModal(false)}
          defaultSize="max-w-2xl"
        >
          <form onSubmit={handleCreatePurchase} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Asset / Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell OptiPlex Desktop Workstation"
                  value={newPurchaseForm.assetName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = assetsList.find((a) => a.name.toLowerCase() === val.toLowerCase());
                    setNewPurchaseForm({
                      ...newPurchaseForm,
                      assetName: val,
                      assetId: found ? found.id : newPurchaseForm.assetId,
                      categoryName: found?.mainCategory || newPurchaseForm.categoryName,
                      subcategoryName: found?.category || newPurchaseForm.subcategoryName,
                      itemType: found?.itemType || newPurchaseForm.itemType,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Supplier / Vendor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell India Enterprise"
                  list="vendorSelectOptions"
                  value={newPurchaseForm.vendorName}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, vendorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
                <datalist id="vendorSelectOptions">
                  {vendorsList.map((v) => (
                    <option key={v.id || v.name} value={v.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Primary Category
                </label>
                <select
                  value={newPurchaseForm.categoryName}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, categoryName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                >
                  {['Furniture', 'Electronics', 'Laboratory', 'IT Hardware'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer / Chair / Projector"
                  value={newPurchaseForm.subcategoryName}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, subcategoryName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  required
                  value={newPurchaseForm.purchaseDate}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Unit Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 65000"
                  value={newPurchaseForm.purchasePrice}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, purchasePrice: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newPurchaseForm.quantity}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Total Amount (Auto-calc)
                </label>
                <div className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  ₹{((parseFloat(newPurchaseForm.purchasePrice) || 0) * (parseInt(newPurchaseForm.quantity, 10) || 1)).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-0881"
                  value={newPurchaseForm.invoiceNumber}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Warranty Coverage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 Years Onsite OEM Warranty"
                  value={newPurchaseForm.warrantyExpiry}
                  onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, warrantyExpiry: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Purchase Remarks / Notes
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Lab expansion batch with upgraded specifications..."
                value={newPurchaseForm.notes}
                onChange={(e) => setNewPurchaseForm({ ...newPurchaseForm, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </Btn>
              <Btn type="submit">
                Save Purchase Transaction
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: ASSET PRICE HISTORY & CHART DRILL-DOWN */}
      {selectedAssetForModal && (
        <AssetPriceHistoryModal
          assetId={selectedAssetForModal.id}
          assetName={selectedAssetForModal.name}
          onClose={() => setSelectedAssetForModal(null)}
        />
      )}

      {/* MODAL 3: VENDOR PURCHASE HISTORY DRILL-DOWN */}
      {selectedVendorForModal && (
        <VendorPurchaseHistoryModal
          vendorId={selectedVendorForModal.id}
          vendorName={selectedVendorForModal.name}
          onClose={() => setSelectedVendorForModal(null)}
        />
      )}
    </div>
  );
};

export default Purchases;
