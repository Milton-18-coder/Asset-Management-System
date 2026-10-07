import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Btn, Badge, Modal, Input, Icon } from '../components/UIComponents';
import { updateFurnitureCustodian, updateFurnitureLocation, updateFurniture, updateFurnitureCondition } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { addPurchaseHistoryRecord } from '../store/purchaseHistorySlice';
import { PriceHistoryChart } from '../components/PriceHistoryChart';
import { recordRecentAccess } from '../utils/recentAccess';
import { api } from '../api';
import { MapPin, User, Mail, Shield, ArrowLeft, Edit3, Building2, Layers, ShoppingBag, Store, Calendar, DollarSign, Plus, FileText, CheckCircle2, TrendingUp, History, Activity, Bell } from 'lucide-react';

export const FurnitureDetail = ({ furniture: propFurniture }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);
  const transfersList = useSelector((state) => state.transfers.list);
  const inspectionsList = useSelector((state) => state.inspections.list);
  const usersList = useSelector((state) => state.users.list);
  const vendorsList = useSelector((state) => state.furniture?.vendors || []);
  const allPurchases = useSelector((state) => state.purchaseHistory?.list || []);

  const furniture = propFurniture || furnitureList.find((f) => f.id === id);

  useEffect(() => {
    if (furniture) {
      recordRecentAccess({
        id: furniture.id,
        name: furniture.name,
        category: furniture.category || furniture.mainCategory,
        department: furniture.department,
        room: furniture.room,
        cost: furniture.cost,
        condition: furniture.condition,
        status: furniture.status,
        type: 'asset'
      });
    }
  }, [furniture]);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [newConditionVal, setNewConditionVal] = useState(furniture?.condition || 'Good');
  const [conditionFeedback, setConditionFeedback] = useState(null);
  const [editRoom, setEditRoom] = useState('');
  const [editBuilding, setEditBuilding] = useState('');
  const [editPerson, setEditPerson] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // New Purchase batch form
  const [purchaseForm, setPurchaseForm] = useState({
    vendorName: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    quantity: 1,
    invoiceNumber: '',
    warrantyExpiry: '3 Years Standard',
    notes: '',
  });

  if (!currentUser) return null;

  if (!furniture) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon.Furniture />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Asset Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">No asset exists with ID "{id}".</p>
        <Btn onClick={() => navigate('/assets')}>Back to Asset List</Btn>
      </div>
    );
  }

  // Filter histories related to this specific asset
  const transfers = transfersList.filter(t => t.assetId === furniture.id);
  const inspections = inspectionsList.filter(i => i.assetId === furniture.id);

  // Asset's complete purchase transactions
  const assetPurchases = allPurchases.filter(
    p => p.assetId === furniture.id || p.assetName === furniture.name
  ).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  // Compute purchase statistics
  const prices = assetPurchases.map(p => Number(p.purchasePrice || 0));
  const latestPurchase = assetPurchases.length > 0 ? assetPurchases[assetPurchases.length - 1] : null;
  const previousPurchase = assetPurchases.length > 1 ? assetPurchases[assetPurchases.length - 2] : null;
  const totalQuantityPurchased = assetPurchases.reduce((s, p) => s + Number(p.quantity || 1), 0) || (furniture.quantity || 1);
  const totalSpend = assetPurchases.reduce((s, p) => s + Number(p.totalAmount || p.purchasePrice * (p.quantity || 1)), 0) || ((furniture.cost || 0) * (furniture.quantity || 1));
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : (furniture.cost || 0);
  const highestPrice = prices.length > 0 ? Math.max(...prices) : (furniture.cost || 0);
  const averagePrice = totalQuantityPurchased > 0 ? totalSpend / totalQuantityPurchased : (furniture.cost || 0);

  const priceHistoryForChart = assetPurchases.map(p => ({
    date: p.purchaseDate,
    price: Number(p.purchasePrice),
    vendor: p.vendorName,
    quantity: p.quantity
  }));

  const handleLogPurchaseBatch = async (e) => {
    e.preventDefault();
    if (!purchaseForm.vendorName) return;
    const priceNum = parseFloat(purchaseForm.purchasePrice) || 0;
    const qtyNum = parseInt(purchaseForm.quantity, 10) || 1;
    const totalAmount = parseFloat((priceNum * qtyNum).toFixed(2));

    const payload = {
      id: `PUR-${Date.now()}`,
      assetId: furniture.id,
      assetName: furniture.name,
      vendorId: null,
      vendorName: purchaseForm.vendorName,
      categoryId: 'CAT-001',
      categoryName: furniture.mainCategory || 'Furniture',
      subcategoryId: 'SUB-001',
      subcategoryName: furniture.category || 'General',
      itemType: furniture.itemType || furniture.category || 'General',
      purchaseDate: purchaseForm.purchaseDate,
      purchasePrice: priceNum,
      quantity: qtyNum,
      totalAmount,
      invoiceNumber: purchaseForm.invoiceNumber,
      invoiceDate: purchaseForm.purchaseDate,
      warrantyExpiry: purchaseForm.warrantyExpiry,
      notes: purchaseForm.notes,
    };

    try {
      let saved = payload;
      try {
        saved = await api.addPurchaseHistory(payload);
      } catch {
        // Fallback
      }
      dispatch(addPurchaseHistoryRecord(saved));

      // Update asset quantity and cost
      dispatch(
        updateFurniture({
          ...furniture,
          cost: priceNum,
          supplier: purchaseForm.vendorName,
          purchaseDate: purchaseForm.purchaseDate,
          quantity: (furniture.quantity || 1) + qtyNum,
        })
      );

      setShowAddPurchaseModal(false);
      setPurchaseForm({
        vendorName: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: '',
        quantity: 1,
        invoiceNumber: '',
        warrantyExpiry: '3 Years Standard',
        notes: '',
      });
    } catch (err) {
      alert('Failed to save purchase batch: ' + err.message);
    }
  };

  const handleOpenReassign = () => {
    setEditRoom(furniture.room || 'CS-101');
    setEditBuilding(furniture.building || 'Engineering Block');
    setEditPerson(furniture.assignedTo || '');
    setEditRole(furniture.assignedRole || 'Faculty In-Charge');
    setEditEmail(furniture.assignedEmail || '');
    setShowReassignModal(true);
  };

  const handleSaveReassign = (e) => {
    e.preventDefault();
    dispatch(
      updateFurnitureLocation({
        id: furniture.id,
        room: editRoom,
        building: editBuilding,
      })
    );
    dispatch(
      updateFurnitureCustodian({
        id: furniture.id,
        assignedTo: editPerson,
        assignedRole: editRole,
        assignedEmail: editEmail,
      })
    );
    dispatch(
      addNotification({
        title: 'Asset Custodian & Location Updated',
        message: `${furniture.name} (${furniture.id}) updated: Room ${editRoom}, assigned to ${editPerson}.`,
        type: 'transfer',
        link: `/assets/${furniture.id}`,
        department: furniture.department,
      })
    );
    setShowReassignModal(false);
  };

  const handleOpenConditionModal = () => {
    setNewConditionVal(furniture.condition || 'Good');
    setShowConditionModal(true);
  };

  const handleSaveCondition = async (e) => {
    e.preventDefault();
    if (!newConditionVal || newConditionVal === furniture.condition) {
      setShowConditionModal(false);
      return;
    }

    const prevCond = furniture.condition;
    dispatch(updateFurnitureCondition({ id: furniture.id, condition: newConditionVal }));

    try {
      await api.updateAssetCondition(furniture.id, newConditionVal, currentUser);
    } catch (err) {
      console.warn('Backend condition update note:', err.message);
    }

    const notif = {
      title: `Asset Condition Updated: ${newConditionVal}`,
      message: `${currentUser.name} (${currentUser.role}) changed condition of ${furniture.name} (${furniture.id}) from "${prevCond}" to "${newConditionVal}". Intimation dispatched via email.`,
      type: 'asset',
      link: `/assets/${furniture.id}`,
      department: furniture.department,
    };
    dispatch(addNotification(notif));

    const isDept = (currentUser?.role || '').toLowerCase().includes('dept');
    setConditionFeedback({
      prev: prevCond,
      next: newConditionVal,
      targetRole: isDept ? 'Super Admin' : `Department Admin (${furniture.department})`,
      editorRole: isDept ? 'Department Admin' : 'Super Admin',
    });

    setTimeout(() => setConditionFeedback(null), 8000);
    setShowConditionModal(false);
  };

  const handleUserSelectAutoFill = (userName) => {
    setEditPerson(userName);
    const foundUser = usersList.find((u) => u.name === userName);
    if (foundUser) {
      setEditRole(foundUser.role || 'Staff In-Charge');
      setEditEmail(foundUser.email || '');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Real-time Email Intimation Toast / Alert */}
      {conditionFeedback && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3 shadow-sm animate-fade-in">
          <div className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                Asset Condition Updated & Email Intimation Dispatched
              </h4>
              <button
                onClick={() => setConditionFeedback(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-0.5">
              Condition transitioned from <span className="font-bold underline">{conditionFeedback.prev}</span> to <span className="font-bold underline">{conditionFeedback.next}</span> by {conditionFeedback.editorRole}.
            </p>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              ✓ Automated Email Intimation routed strictly to: <strong className="text-indigo-900 dark:text-indigo-100">{conditionFeedback.targetRole}</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/assets')} 
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-none">
              {furniture.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                {furniture.id}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {furniture.mainCategory ? `${furniture.mainCategory} › ` : ''}{furniture.category} {furniture.itemType ? `› ${furniture.itemType}` : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
          <button
            onClick={handleOpenConditionModal}
            className="group flex items-center gap-1.5 p-1 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Click to edit condition (triggers email intimation)"
          >
            <Badge label={furniture.condition} type="condition" />
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400 flex items-center gap-0.5">
              <Edit3 className="w-3 h-3" /> Edit
            </span>
          </button>
          <Badge label={furniture.status} />
          <Btn variant="secondary" onClick={() => navigate(`/assets/edit/${furniture.id}`)} size="sm">
            <Icon.Edit /> Edit Full Asset
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* WHERE & WHO BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WHERE IT IS */}
            <Card className="p-4 border-2 border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4" /> Where is it located?
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-display">
                Room {furniture.room || 'Unassigned'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {furniture.building || 'Main Block'} · {furniture.department || 'General'}
              </p>
            </Card>

            {/* WHO IS USING IT */}
            <Card className="p-4 border-2 border-violet-100 dark:border-violet-900/40 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/20 dark:to-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-wider">
                  <User className="w-4 h-4" /> Assigned Custodian
                </div>
                <button
                  onClick={handleOpenReassign}
                  className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" /> Reassign
                </button>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-display">
                {furniture.assignedTo || 'Unassigned / Open Access'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {furniture.assignedRole || 'General Custody'} {furniture.assignedEmail ? `· ${furniture.assignedEmail}` : ''}
              </p>
            </Card>
          </div>

          {/* Detailed specs */}
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">
              Asset Specification & Taxonomy Profile
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-sm">
              {[
                ['Asset ID', furniture.id],
                ['Asset Name', furniture.name],
                ['Primary Category', furniture.mainCategory || 'Furniture'],
                ['Subcategory', furniture.category],
                ['Specific Item Type', furniture.itemType || furniture.category],
                ['Quantity In-Stock', `${furniture.quantity || 1} units`],
                ['Physical Condition', furniture.condition],
                ['Operational Status', furniture.status],
                ['Building Sector', furniture.building],
                ['Department', furniture.department],
                ['Room Assigned', `Room ${furniture.room}`],
                ['Custodian / User', furniture.assignedTo || 'Unassigned'],
                ['Acquisition Cost', `₹${(furniture.cost || 0).toLocaleString()}`],
                ['Purchase Date', furniture.purchaseDate || '—'],
                ['Supplier Name', furniture.supplier || '—'],
                ['Warranty Period', furniture.warranty || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{k}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{v}</span>
                </div>
              ))}
              <div className="sm:col-span-2 md:col-span-3 flex flex-col gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Technical Description</span>
                <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {furniture.description || 'No additional technical description provided.'}
                </span>
              </div>
            </div>
          </Card>

          {/* Purchase & Vendor History Card */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-white font-display text-sm tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Purchase & Vendor History</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete historical procurement transactions and price tracking
                </p>
              </div>
              <Btn size="sm" onClick={() => setShowAddPurchaseModal(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Log Purchase Batch
              </Btn>
            </div>

            {/* Pricing Summary Indicators */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latest Price</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                    ₹{(latestPurchase?.purchasePrice || furniture.cost || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    {latestPurchase?.vendorName || furniture.supplier || 'Primary Vendor'}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Quantity</span>
                  <span className="text-base font-black text-slate-800 dark:text-white font-mono">
                    {totalQuantityPurchased} units
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    Across {assetPurchases.length || 1} batches
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expenditure</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    ₹{totalSpend.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    Avg: ₹{Math.round(averagePrice).toLocaleString()} / unit
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price Range</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    ₹{lowestPrice.toLocaleString()} - ₹{highestPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    First: {assetPurchases[0]?.purchaseDate || furniture.purchaseDate || '—'}
                  </span>
                </div>
              </div>

              {/* Price Trend Chart if multi-purchases */}
              {priceHistoryForChart.length > 1 && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <PriceHistoryChart data={priceHistoryForChart} height={140} />
                </div>
              )}
            </div>

            {/* Purchase History Table */}
            {assetPurchases.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Initial purchase record registered: {furniture.supplier || 'Supplier'} (₹{(furniture.cost || 0).toLocaleString()}) on {furniture.purchaseDate || '—'}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-5 py-3.5">Purchase Date</th>
                      <th className="px-5 py-3.5">Vendor / Supplier</th>
                      <th className="px-4 py-3.5 text-right">Unit Price</th>
                      <th className="px-4 py-3.5 text-center">Qty</th>
                      <th className="px-5 py-3.5 text-right">Total Amount</th>
                      <th className="px-5 py-3.5">Invoice #</th>
                      <th className="px-5 py-3.5">Warranty & Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {[...assetPurchases].reverse().map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{p.purchaseDate}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span>{p.vendorName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          ₹{Number(p.purchasePrice || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {p.quantity || 1}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ₹{Number(p.totalAmount || (p.purchasePrice * (p.quantity || 1))).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                          {p.invoiceNumber || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={p.notes || p.warrantyExpiry}>
                          {p.warrantyExpiry ? `[${p.warrantyExpiry}] ` : ''}{p.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Transfer History Table */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="font-bold text-slate-800 dark:text-white font-display text-sm tracking-tight">
                Location & Room Transfer History
              </p>
              <Btn size="sm" variant="secondary" onClick={() => navigate('/transfers')}>
                Request Transfer
              </Btn>
            </div>
            {transfers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                No transfer operations logged for this asset.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      {['Transfer ID', 'Origin Room', 'Target Room', 'Requester', 'Logged Date', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {transfers.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="px-5 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{t.id}</td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{t.source}</td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{t.destination}</td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{t.requester}</td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-500 font-medium">{t.date}</td>
                        <td className="px-5 py-3.5"><Badge label={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Inspection History Table */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="font-bold text-slate-800 dark:text-white font-display text-sm tracking-tight">
                Condition Audits & Inspections
              </p>
              <Btn size="sm" variant="secondary" onClick={() => navigate('/inspections')}>
                New Audit
              </Btn>
            </div>
            {inspections.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                No inspections recorded for this asset yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      {['Inspection ID', 'Inspector', 'Log Date', 'Condition State', 'Notes / Remarks'].map(h => (
                        <th key={h} className="px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {inspections.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="px-5 py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{i.id}</td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-bold">{i.inspector}</td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-500 font-medium">{i.date}</td>
                        <td className="px-5 py-3.5"><Badge label={i.condition} type="condition" /></td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate" title={i.notes}>
                          {i.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Asset Info Summary Card */}
          <Card className="p-5 space-y-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                {furniture.id}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                {furniture.quantity || 1} units
              </span>
            </div>
            
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Taxonomy Tier</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {furniture.mainCategory || 'Furniture'}
                </span>
                <span className="text-slate-400">›</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  {furniture.category}
                </span>
                {furniture.itemType && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-medium">
                      {furniture.itemType}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Purchase Value</span>
              <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 font-display">₹{(furniture.cost || 0).toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 font-display tracking-tight">
              Active Placement & Custody
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{furniture.building}</p>
                  <p className="text-slate-400">{furniture.department} Department</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Room {furniture.room}</p>
                  <p className="text-slate-400">Assigned Location</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-violet-50/60 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/40">
                <User className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{furniture.assignedTo || 'Unassigned'}</p>
                  <p className="text-violet-600 dark:text-violet-400">{furniture.assignedRole || 'Custodian'}</p>
                </div>
              </div>
            </div>

            <Btn 
              variant="secondary" 
              className="w-full justify-center" 
              onClick={handleOpenReassign}
            >
              <Edit3 className="w-4 h-4" /> Quick Reassign Custodian / Room
            </Btn>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Quick Operations</p>
            <div className="space-y-2.5">
              <Btn 
                variant="secondary" 
                className="w-full justify-center cursor-pointer" 
                size="sm" 
                onClick={() => navigate('/transfers')}
              >
                <Icon.Transfer /> Create Transfer Request
              </Btn>
              <Btn 
                variant="secondary" 
                className="w-full justify-center cursor-pointer" 
                size="sm" 
                onClick={() => navigate('/inspections')}
              >
                <Icon.Inspection /> Log Physical Audit
              </Btn>
              <Btn 
                variant="secondary" 
                className="w-full justify-center cursor-pointer" 
                size="sm" 
                onClick={() => navigate('/category')}
              >
                <Icon.Furniture /> Browse Category Locator
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal: Reassign Custodian & Room */}
      {showReassignModal && (
        <Modal 
          title={`Reassign Location & Custodian — ${furniture.name}`} 
          onClose={() => setShowReassignModal(false)}
        >
          <form onSubmit={handleSaveReassign} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Building"
                value={editBuilding}
                onChange={(e) => setEditBuilding(e.target.value)}
                placeholder="e.g. Engineering Block"
                required
              />

              <Input
                label="Room / Lab Number"
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
                placeholder="e.g. CS-101"
                required
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Select Registered Institutional User (Auto-fill)
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) handleUserSelectAutoFill(e.target.value);
                }}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="">-- Choose faculty/staff member --</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role} - {u.department})
                  </option>
                ))}
              </select>

              <Input
                label="Assigned Person / User Name"
                value={editPerson}
                onChange={(e) => setEditPerson(e.target.value)}
                placeholder="e.g. Prof. Anitha Sharma"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Role / Designation"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="e.g. Faculty In-Charge"
                />

                <Input
                  label="Contact Email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. user@nec.edu.in"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" onClick={() => setShowReassignModal(false)}>
                Cancel
              </Btn>
              <Btn type="submit">
                Save & Update Assignment
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Log New Purchase Batch */}
      {showAddPurchaseModal && (
        <Modal
          title={`Log Purchase Batch — ${furniture.name}`}
          onClose={() => setShowAddPurchaseModal(false)}
        >
          <form onSubmit={handleLogPurchaseBatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Supplier / Vendor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Godrej Interio / Dell India"
                  list="vendorDetailList"
                  value={purchaseForm.vendorName}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, vendorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
                <datalist id="vendorDetailList">
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
                  value={purchaseForm.purchaseDate}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Unit Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 7500"
                  value={purchaseForm.purchasePrice}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: e.target.value })}
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
                  value={purchaseForm.quantity}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Calculated Total
                </label>
                <div className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  ₹{((parseFloat(purchaseForm.purchasePrice) || 0) * (parseInt(purchaseForm.quantity, 10) || 1)).toLocaleString()}
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
                  placeholder="e.g. INV-2026-8801"
                  value={purchaseForm.invoiceNumber}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
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
                  value={purchaseForm.warrantyExpiry}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, warrantyExpiry: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Purchase Notes / Remarks
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Replenishment stock for semester labs..."
                value={purchaseForm.notes}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" type="button" onClick={() => setShowAddPurchaseModal(false)}>
                Cancel
              </Btn>
              <Btn type="submit">
                Record Purchase Batch
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* QUICK CONDITION UPDATE MODAL WITH AUTOMATED INTIMATION DIRECTIVE */}
      {showConditionModal && (
        <Modal
          title={`Update Condition: ${furniture.name}`}
          onClose={() => setShowConditionModal(false)}
        >
          <form onSubmit={handleSaveCondition} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{furniture.id}</span>
                <span className="text-xs text-slate-500 font-medium">{furniture.department}</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{furniture.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Location: Room {furniture.room} ({furniture.building})</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Current Condition State
              </label>
              <div className="flex items-center gap-2 mb-3">
                <Badge label={furniture.condition || 'Good'} type="condition" />
                <span className="text-xs text-slate-400">➔ Select new state below</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                New Condition State *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Good', 'Fair', 'Poor', 'Damaged'].map((c) => {
                  const isSelected = newConditionVal === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewConditionVal(c)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AUTOMATED INTIMATION POLICY DIRECTIVE */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <strong className="block font-bold mb-0.5">Automated Two-Way Email Intimation Protocol:</strong>
                {(currentUser?.role || '').toLowerCase().includes('dept') ? (
                  <span>
                    As <strong>Department Admin</strong>, editing this condition will immediately dispatch an intimation email strictly to the <strong>Super Admin</strong>.
                  </span>
                ) : (
                  <span>
                    As <strong>Super Admin</strong>, editing this condition will immediately dispatch an intimation email strictly to the respective <strong>Department Admin ({furniture.department})</strong>.
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" type="button" onClick={() => setShowConditionModal(false)}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={newConditionVal === furniture.condition}>
                Update Condition & Send Intimation
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
