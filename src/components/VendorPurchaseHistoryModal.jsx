import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Btn, Input, Select } from './UIComponents';
import { AssetPriceHistoryModal } from './AssetPriceHistoryModal';
import { api } from '../api';
import {
  Store,
  Calendar,
  Layers,
  Search,
  SlidersHorizontal,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Star,
  ExternalLink,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

export const VendorPurchaseHistoryModal = ({ vendor, vendorId, vendorName, onClose }) => {
  const purchaseList = useSelector((state) => state.purchaseHistory?.list || []);
  const [vendorData, setVendorData] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [searchAsset, setSearchAsset] = useState('');
  const [sortField, setSortField] = useState('purchaseDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Drill-down asset modal
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState(null);

  const targetVendorId = vendor?.id || vendorId || vendorName;
  const targetVendorName = vendor?.name || vendorName || vendor?.id || 'Vendor';

  const loadVendorHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getPurchaseHistoryByVendor(targetVendorId);
      setVendorData(res.vendor || vendor);
      setPurchases(res.purchases || []);
    } catch (err) {
      console.warn('Backend vendor history error, fallback to Redux:', err.message);
      const matched = purchaseList.filter(
        (p) => (vendor?.id && p.vendorId === vendor.id) || p.vendorName === targetVendorName
      );
      setVendorData(vendor || { name: targetVendorName });
      setPurchases(matched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorHistory();
  }, [targetVendorId, targetVendorName, purchaseList]);

  // Unique categories & subcategories from this vendor's purchases
  const availableCategories = useMemo(() => {
    const set = new Set(purchases.map((p) => p.categoryName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [purchases]);

  const availableSubCategories = useMemo(() => {
    let list = purchases;
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.categoryName === selectedCategory);
    }
    const set = new Set(list.map((p) => p.subcategoryName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [purchases, selectedCategory]);

  // Filter and sort purchases
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        if (fromDate && new Date(p.purchaseDate) < new Date(fromDate)) return false;
        if (toDate && new Date(p.purchaseDate) > new Date(toDate)) return false;
        if (selectedCategory !== 'All' && p.categoryName !== selectedCategory) return false;
        if (selectedSubCategory !== 'All' && p.subcategoryName !== selectedSubCategory) return false;
        if (searchAsset) {
          const q = searchAsset.toLowerCase();
          const matchName = p.assetName?.toLowerCase().includes(q);
          const matchId = p.assetId?.toLowerCase().includes(q);
          const matchInv = p.invoiceNumber?.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchInv) return false;
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
  }, [purchases, fromDate, toDate, selectedCategory, selectedSubCategory, searchAsset, sortField, sortAsc]);

  // Summary KPIs for current filtered view
  const currentTotalSpend = filteredPurchases.reduce((s, p) => s + Number(p.totalAmount || p.purchasePrice * (p.quantity || 1)), 0);
  const currentTotalUnits = filteredPurchases.reduce((s, p) => s + Number(p.quantity || 1), 0);
  const uniqueItemsCount = new Set(filteredPurchases.map((p) => p.assetName)).size;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSearchAsset('');
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Vendor Procurement & Purchase Profile</span>
        </div>
      }
      onClose={onClose}
      defaultSize="max-w-5xl"
    >
      <div className="space-y-5">
        {/* Vendor Header Card */}
        <div className="bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/20 flex-shrink-0">
                {targetVendorName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">
                    {targetVendorName}
                  </h2>
                  {vendorData?.rating && (
                    <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded-lg text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{parseFloat(vendorData.rating).toFixed(1)}</span>
                    </span>
                  )}
                  {vendorData?.id && (
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {vendorData.id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  {vendorData?.services || 'Approved Institutional Hardware & Equipment Supplier'}
                </p>
              </div>
            </div>

            {/* Vendor Contact details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              {vendorData?.contactPerson && (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-400">Contact:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{vendorData.contactPerson}</strong>
                </div>
              )}
              {vendorData?.email && (
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${vendorData.email}`} className="hover:underline text-indigo-600 dark:text-indigo-400 truncate">{vendorData.email}</a>
                </div>
              )}
              {vendorData?.phone && (
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{vendorData.phone}</span>
                </div>
              )}
              {vendorData?.gstin && (
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>GST: {vendorData.gstin}</span>
                </div>
              )}
              {vendorData?.address && (
                <div className="col-span-2 flex items-center gap-1.5 truncate text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{vendorData.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* KPI Mini Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            <div className="bg-white/80 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Spend</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                ₹{currentTotalSpend.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Units Purchased</span>
              <span className="text-base font-black text-slate-800 dark:text-white font-mono">
                {currentTotalUnits} units
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transactions</span>
              <span className="text-base font-black text-slate-800 dark:text-white font-mono">
                {filteredPurchases.length} orders
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unique Products</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {uniqueItemsCount} items
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, IDs, invoices..."
                value={searchAsset}
                onChange={(e) => setSearchAsset(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            {/* From Date */}
            <div>
              <input
                type="date"
                title="From Date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            {/* To Date */}
            <div>
              <input
                type="date"
                title="To Date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            {/* Subcategory */}
            <div>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              >
                {availableSubCategories.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Subcategories' : s}</option>
                ))}
              </select>
            </div>
          </div>

          {(fromDate || toDate || selectedCategory !== 'All' || selectedSubCategory !== 'All' || searchAsset) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Filtered: Showing <strong>{filteredPurchases.length}</strong> of {purchases.length} transactions
              </span>
              <button
                onClick={clearFilters}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Products Purchased Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Products Purchased From This Vendor
            </h3>
            <span className="text-[11px] text-slate-400">
              Click any asset name to view its price trajectory chart & complete purchase timeline
            </span>
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              No purchase records match the selected date range or category filters.
            </div>
          ) : (
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap bg-slate-50/70 dark:bg-slate-800/40">
                      <th className="px-4 py-3 cursor-pointer hover:text-slate-600" onClick={() => handleSort('assetName')}>
                        <div className="flex items-center gap-1">
                          <span>Asset / Product</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Subcategory</th>
                      <th className="px-3 py-3 cursor-pointer hover:text-slate-600" onClick={() => handleSort('purchaseDate')}>
                        <div className="flex items-center gap-1">
                          <span>Purchase Date</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-right cursor-pointer hover:text-slate-600" onClick={() => handleSort('purchasePrice')}>
                        <div className="flex items-center justify-end gap-1">
                          <span>Unit Price</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-center cursor-pointer hover:text-slate-600" onClick={() => handleSort('quantity')}>
                        <div className="flex items-center justify-center gap-1">
                          <span>Qty</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right cursor-pointer hover:text-slate-600" onClick={() => handleSort('totalAmount')}>
                        <div className="flex items-center justify-end gap-1">
                          <span>Total Amount</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3">Invoice #</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                    {filteredPurchases.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 min-w-[200px]">
                          <button
                            onClick={() => setSelectedAssetForDetails({ id: p.assetId, name: p.assetName })}
                            className="text-left font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1.5 cursor-pointer group"
                          >
                            <span>{p.assetName}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                          <span className="font-mono text-[11px] text-slate-400 block">{p.assetId}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {p.categoryName}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            {p.subcategoryName}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                          {p.purchaseDate}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          ₹{Number(p.purchasePrice || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {p.quantity || 1}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ₹{Number(p.totalAmount || (p.purchasePrice * (p.quantity || 1))).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">
                          {p.invoiceNumber || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Btn variant="secondary" onClick={onClose}>
            Close
          </Btn>
        </div>
      </div>

      {/* Drill-down Asset Price History Modal */}
      {selectedAssetForDetails && (
        <AssetPriceHistoryModal
          assetId={selectedAssetForDetails.id}
          assetName={selectedAssetForDetails.name}
          onClose={() => setSelectedAssetForDetails(null)}
        />
      )}
    </Modal>
  );
};

export default VendorPurchaseHistoryModal;
