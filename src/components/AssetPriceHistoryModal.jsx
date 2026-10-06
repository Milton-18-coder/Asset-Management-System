import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Btn, Input, Select } from './UIComponents';
import { PriceHistoryChart } from './PriceHistoryChart';
import { api } from '../api';
import { addPurchaseHistoryRecord } from '../store/purchaseHistorySlice';
import { updateFurniture } from '../store/furnitureSlice';
import {
  Package,
  Calendar,
  Store,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ShieldCheck,
  Hash,
  Layers,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';

export const AssetPriceHistoryModal = ({ assetId, assetName, initialAsset = null, onClose, onPurchaseAdded }) => {
  const dispatch = useDispatch();
  const purchaseList = useSelector((state) => state.purchaseHistory?.list || []);
  const vendorsList = useSelector((state) => state.furniture?.vendors || []);
  const assetsList = useSelector((state) => state.furniture?.list || []);

  const [loading, setLoading] = useState(true);
  const [assetAnalytics, setAssetAnalytics] = useState(null);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Find target asset if in Redux
  const currentAsset = useMemo(() => {
    return (
      initialAsset ||
      assetsList.find((a) => a.id === assetId || a.name === assetName) ||
      null
    );
  }, [initialAsset, assetsList, assetId, assetName]);

  // Form state for logging a new purchase transaction for this asset
  const [newBatch, setNewBatch] = useState({
    vendorName: '',
    vendorId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    quantity: 1,
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: '3 Years Standard',
    notes: '',
  });

  const loadAssetHistory = async () => {
    const targetId = assetId || currentAsset?.id || assetName;
    if (!targetId) return;

    const buildReduxFallback = () => {
      const localRecords = purchaseList.filter(
        (p) => p.assetId === assetId || p.assetName === assetName || (currentAsset && p.assetId === currentAsset.id)
      ).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

      if (localRecords.length > 0) {
        const prices = localRecords.map((p) => Number(p.purchasePrice || 0));
        const quantities = localRecords.map((p) => Number(p.quantity || 1));
        const totalAmounts = localRecords.map((p) => Number(p.totalAmount || p.purchasePrice * (p.quantity || 1)));

        const latest = localRecords[localRecords.length - 1];
        const previous = localRecords.length > 1 ? localRecords[localRecords.length - 2] : null;
        const totalQuantity = quantities.reduce((a, b) => a + b, 0);
        const totalSpent = totalAmounts.reduce((a, b) => a + b, 0);

        return {
          assetId: currentAsset?.id || assetId,
          assetName: currentAsset?.name || assetName || localRecords[0].assetName,
          categoryName: currentAsset?.mainCategory || localRecords[0].categoryName || 'Furniture',
          subcategoryName: currentAsset?.category || localRecords[0].subcategoryName || 'General',
          summary: {
            latestPrice: Number(latest.purchasePrice),
            latestPurchaseDate: latest.purchaseDate,
            latestVendor: latest.vendorName,
            previousPrice: previous ? Number(previous.purchasePrice) : null,
            previousPurchaseDate: previous ? previous.purchaseDate : null,
            lowestPrice: Math.min(...prices),
            highestPrice: Math.max(...prices),
            averagePrice: totalSpent / (totalQuantity || 1),
            totalQuantity,
            totalSpent,
            transactionCount: localRecords.length,
            priceHistory: localRecords.map((p) => ({
              id: p.id,
              date: p.purchaseDate,
              price: Number(p.purchasePrice),
              vendor: p.vendorName,
              vendorId: p.vendorId,
              quantity: p.quantity,
              totalAmount: Number(p.totalAmount || p.purchasePrice * p.quantity),
              invoiceNumber: p.invoiceNumber
            }))
          },
          purchases: [...localRecords].reverse()
        };
      }
      return null;
    };

    try {
      setLoading(true);
      const data = await api.getPurchaseHistoryByAsset(targetId);
      if (data && data.purchases && data.purchases.length > 0) {
        setAssetAnalytics(data);
      } else {
        const fallback = buildReduxFallback();
        setAssetAnalytics(fallback || data);
      }
    } catch (err) {
      console.warn('Backend asset purchase history fetch error, fallback to Redux:', err.message);
      setAssetAnalytics(buildReduxFallback());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssetHistory();
  }, [assetId, assetName, purchaseList]);

  // Handle logging new purchase transaction batch
  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newBatch.vendorName) {
      setErrorMsg('Please select or specify a vendor.');
      return;
    }
    const priceNum = parseFloat(newBatch.purchasePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Please enter a valid non-negative purchase price.');
      return;
    }
    const qtyNum = parseInt(newBatch.quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 1) {
      setErrorMsg('Quantity must be at least 1.');
      return;
    }

    const payload = {
      id: `PUR-${Date.now()}`,
      assetId: currentAsset?.id || assetId || `AST-${Date.now()}`,
      assetName: currentAsset?.name || assetName || 'Asset Item',
      vendorId: newBatch.vendorId || null,
      vendorName: newBatch.vendorName,
      categoryId: 'CAT-001',
      categoryName: currentAsset?.mainCategory || 'Furniture',
      subcategoryId: 'SUB-001',
      subcategoryName: currentAsset?.category || 'General',
      itemType: currentAsset?.itemType || currentAsset?.category || 'General',
      purchaseDate: newBatch.purchaseDate,
      purchasePrice: priceNum,
      quantity: qtyNum,
      totalAmount: parseFloat((priceNum * qtyNum).toFixed(2)),
      invoiceNumber: newBatch.invoiceNumber.trim(),
      invoiceDate: newBatch.invoiceDate || newBatch.purchaseDate,
      warrantyExpiry: newBatch.warrantyExpiry.trim(),
      notes: newBatch.notes.trim()
    };

    try {
      let savedRecord = payload;
      try {
        savedRecord = await api.addPurchaseHistory(payload);
      } catch {
        // Backend optional fallback
      }

      dispatch(addPurchaseHistoryRecord(savedRecord));

      // Update asset quantity and latest cost in Redux
      if (currentAsset) {
        dispatch(
          updateFurniture({
            ...currentAsset,
            cost: priceNum,
            supplier: newBatch.vendorName,
            purchaseDate: newBatch.purchaseDate,
            warranty: newBatch.warrantyExpiry || currentAsset.warranty,
            quantity: (currentAsset.quantity || 1) + qtyNum
          })
        );
      }

      setSuccessMsg(`New purchase record for ₹${priceNum.toLocaleString()} (${qtyNum} units) logged successfully!`);
      setShowAddBatch(false);
      setNewBatch({
        vendorName: '',
        vendorId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: '',
        quantity: 1,
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        warrantyExpiry: '3 Years Standard',
        notes: '',
      });

      await loadAssetHistory();
      if (onPurchaseAdded) onPurchaseAdded(savedRecord);
    } catch (err) {
      setErrorMsg('Error saving purchase record: ' + err.message);
    }
  };

  const displayName = currentAsset?.name || assetAnalytics?.assetName || assetName || 'Asset Price Intelligence';
  const displayId = currentAsset?.id || assetAnalytics?.assetId || assetId;
  const summary = assetAnalytics?.summary;
  const purchases = assetAnalytics?.purchases || [];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Purchase History & Price Intelligence</span>
        </div>
      }
      onClose={onClose}
      defaultSize="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Asset Header Ribbon */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                {displayId}
              </span>
              <span className="text-xs text-slate-400">
                {currentAsset?.mainCategory || assetAnalytics?.categoryName || 'Furniture'} ›{' '}
                <strong className="text-slate-700 dark:text-slate-300">{currentAsset?.category || assetAnalytics?.subcategoryName || 'General'}</strong>
                {currentAsset?.itemType ? ` › ${currentAsset.itemType}` : ''}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display">
              {displayName}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <Btn
              onClick={() => setShowAddBatch(!showAddBatch)}
              className="!py-2 !px-3.5 text-xs font-bold"
            >
              <Plus className="w-4 h-4 mr-1" /> Log New Purchase
            </Btn>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl p-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-xl p-3">
            {errorMsg}
          </div>
        )}

        {/* Collapsible: Log New Purchase Batch Form */}
        {showAddBatch && (
          <form onSubmit={handleAddBatchSubmit} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" /> Record Additional Purchase Batch (Historical Entry)
              </h4>
              <button
                type="button"
                onClick={() => setShowAddBatch(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Vendor / Supplier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell India Enterprise"
                  list="vendorOptionsList"
                  value={newBatch.vendorName}
                  onChange={(e) => setNewBatch({ ...newBatch, vendorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
                <datalist id="vendorOptionsList">
                  {vendorsList.map((v) => (
                    <option key={v.id || v.name} value={v.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  required
                  value={newBatch.purchaseDate}
                  onChange={(e) => setNewBatch({ ...newBatch, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Unit Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 65000"
                  value={newBatch.purchasePrice}
                  onChange={(e) => setNewBatch({ ...newBatch, purchasePrice: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBatch.quantity}
                  onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Calculated Total
                </label>
                <div className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  ₹{((parseFloat(newBatch.purchasePrice) || 0) * (parseInt(newBatch.quantity, 10) || 1)).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-908"
                  value={newBatch.invoiceNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Warranty Coverage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 Years Onsite"
                  value={newBatch.warrantyExpiry}
                  onChange={(e) => setNewBatch({ ...newBatch, warrantyExpiry: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                placeholder="Purchase remarks or batch reference..."
                value={newBatch.notes}
                onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                className="flex-1 mr-3 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
              />
              <Btn type="submit" size="sm">
                Save Purchase Record
              </Btn>
            </div>
          </form>
        )}

        {/* 8-Point Comprehensive Pricing KPI Grid */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Latest Price */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Latest Price</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  ₹{Number(summary.latestPrice || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                {summary.latestPurchaseDate || 'Recent'} · {summary.latestVendor || 'Supplier'}
              </span>
            </div>

            {/* Previous Price */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Previous Price</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-black text-slate-700 dark:text-slate-300 font-mono">
                  {summary.previousPrice ? `₹${Number(summary.previousPrice).toLocaleString()}` : '—'}
                </span>
                {summary.previousPrice && summary.priceChangePercentage && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      parseFloat(summary.priceChangePercentage) > 0
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    }`}
                  >
                    {parseFloat(summary.priceChangePercentage) > 0 ? `+${summary.priceChangePercentage}%` : `${summary.priceChangePercentage}%`}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                {summary.previousPurchaseDate || 'Prior batch'}
              </span>
            </div>

            {/* Lowest & Highest Price */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Price Range (Min - Max)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ₹{Number(summary.lowestPrice || 0).toLocaleString()}
                </span>
                <span className="text-slate-400 text-xs">to</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  ₹{Number(summary.highestPrice || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                Avg: <strong className="text-indigo-600 dark:text-indigo-400">₹{Math.round(summary.averagePrice || 0).toLocaleString()}</strong>
              </span>
            </div>

            {/* Total Quantity & Total Spend */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Expenditure</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  ₹{Number(summary.totalSpent || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                {summary.totalQuantity || 1} units across {summary.transactionCount || 1} batches
              </span>
            </div>
          </div>
        )}

        {/* Price History Interactive Chart */}
        {summary?.priceHistory && summary.priceHistory.length > 0 && (
          <div className="pt-2">
            <PriceHistoryChart data={summary.priceHistory} height={160} />
          </div>
        )}

        {/* Complete Historical Purchase Transactions Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Complete Purchase Transactions Log
            </h3>
            <span className="text-xs text-slate-500">{purchases.length} historical records</span>
          </div>

          {purchases.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              No purchase history transactions logged for this item yet. Click "+ Log New Purchase" above to record one.
            </div>
          ) : (
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap bg-slate-50/70 dark:bg-slate-800/40">
                      <th className="px-4 py-3">Purchase Date</th>
                      <th className="px-4 py-3">Vendor / Supplier</th>
                      <th className="px-3 py-3 text-right">Unit Price</th>
                      <th className="px-3 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Warranty / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                    {purchases.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{p.purchaseDate}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span>{p.vendorName}</span>
                          </div>
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
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {p.invoiceNumber || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={p.notes || p.warrantyExpiry}>
                          {p.warrantyExpiry ? `[${p.warrantyExpiry}] ` : ''}{p.notes || '—'}
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
    </Modal>
  );
};

export default AssetPriceHistoryModal;
