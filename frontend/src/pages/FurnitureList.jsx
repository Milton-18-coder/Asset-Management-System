import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { deleteFurniture, updateFurnitureCondition } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Modal, Icon } from '../components/UIComponents';
import { useRecentAccess, recordRecentAccess } from '../utils/recentAccess';
import { api } from '../api';
import { MapPin, User, Search, Layers, History, Sparkles, Edit3, Mail } from 'lucide-react';

export const FurnitureList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);
  const { recentItems } = useRecentAccess();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState(searchParams.get('category') || 'All');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'All');
  const [filterCond, setFilterCond] = useState(searchParams.get('condition') || 'All');
  const [onlyRecent, setOnlyRecent] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [conditionModalAsset, setConditionModalAsset] = useState(null);
  const [newConditionVal, setNewConditionVal] = useState('Good');
  const [conditionFeedback, setConditionFeedback] = useState(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const condition = searchParams.get('condition');
    const category = searchParams.get('category');
    if (status) setFilterStatus(status);
    if (condition) setFilterCond(condition);
    if (category) setFilterCat(category);
  }, [searchParams]);

  const handleOpenConditionModal = (e, asset) => {
    e.stopPropagation();
    setConditionModalAsset(asset);
    setNewConditionVal(asset.condition || 'Good');
  };

  const handleSaveCondition = async (e) => {
    e.preventDefault();
    if (!conditionModalAsset || !newConditionVal || newConditionVal === conditionModalAsset.condition) {
      setConditionModalAsset(null);
      return;
    }

    const prevCond = conditionModalAsset.condition;
    const targetAsset = conditionModalAsset;
    dispatch(updateFurnitureCondition({ id: targetAsset.id, condition: newConditionVal }));

    let resData = null;
    try {
      resData = await api.updateAssetCondition(targetAsset.id, newConditionVal, currentUser);
    } catch (err) {
      console.warn('Backend condition update note:', err.message);
    }

    const isDept = (currentUser?.role || '').toLowerCase().includes('dept');
    const notifInfo = resData?.notification || null;

    const notif = {
      title: `Asset Condition Updated: ${newConditionVal}`,
      message: `${currentUser.name} (${currentUser.role}) changed condition of ${targetAsset.name} (${targetAsset.id}) from "${prevCond}" to "${newConditionVal}". Intimation dispatched via email & WhatsApp.`,
      type: 'asset',
      link: `/assets/${targetAsset.id}`,
      department: targetAsset.department,
      direction: isDept ? 'deptadmin_to_superadmin' : 'superadmin_to_deptadmin',
      notification_channel: 'in-app'
    };
    dispatch(addNotification(notif));

    setConditionFeedback({
      assetName: targetAsset.name,
      assetId: targetAsset.id,
      prev: prevCond,
      next: newConditionVal,
      targetRole: isDept ? 'Super Admin' : `Department Admin (${targetAsset.department})`,
      editorRole: isDept ? 'Department Admin' : 'Super Admin',
      notification: notifInfo
    });

    setTimeout(() => setConditionFeedback(null), 8000);
    setConditionModalAsset(null);
  };

  if (!currentUser) return null;

  // Filter list by role (dept admin only sees their own dept)
  const sourceList = useMemo(() => {
    if (currentUser.role === 'superadmin') return furnitureList;
    return furnitureList.filter(f => f.department === currentUser.department);
  }, [furnitureList, currentUser]);

  // Categories list for dropdown
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(sourceList.map(f => f.category || f.mainCategory).filter(Boolean)))];
  }, [sourceList]);

  // Search & Filter algorithm
  const filteredList = useMemo(() => {
    const recentIds = new Set(recentItems.map(r => r.id));
    return sourceList.filter(f => {
      if (onlyRecent && !recentIds.has(f.id)) return false;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        f.id.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        (f.itemType && f.itemType.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q)) ||
        (f.mainCategory && f.mainCategory.toLowerCase().includes(q)) ||
        (f.room && f.room.toLowerCase().includes(q)) ||
        (f.building && f.building.toLowerCase().includes(q)) ||
        (f.assignedTo && f.assignedTo.toLowerCase().includes(q)) ||
        (f.assignedRole && f.assignedRole.toLowerCase().includes(q));
      const matchCat = filterCat === 'All' || f.category === filterCat || f.mainCategory === filterCat;
      const matchStatus = filterStatus === 'All' || f.status === filterStatus;
      const matchCond = filterCond === 'All' || f.condition === filterCond;
      return matchSearch && matchCat && matchStatus && matchCond;
    });
  }, [search, filterCat, filterStatus, filterCond, onlyRecent, recentItems, sourceList]);

  const handleDelete = (id) => {
    const asset = furnitureList.find(f => f.id === id);
    dispatch(deleteFurniture(id));
    if (asset) {
      dispatch(
        addNotification({
          title: 'Asset Deleted',
          message: `${asset.name} (${id}) was deleted by ${currentUser.name}.`,
          type: 'asset',
          link: '/assets',
          department: asset.department,
        })
      );
    }
    setDeleteId(null);
  };

  const handleExport = () => {
    if (filteredList.length === 0) {
      alert('No assets available to export.');
      return;
    }

    // Define CSV Headers
    const headers = ['Asset ID', 'Name', 'Primary Category', 'Subcategory', 'Item Type', 'Building', 'Department', 'Room', 'Assigned Custodian', 'Custodian Role', 'Qty', 'Condition', 'Status', 'Purchase Date', 'Cost', 'Supplier', 'Warranty', 'Description'];

    // Map assets to CSV rows
    const rows = filteredList.map(item => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.mainCategory || 'Furniture',
      item.category,
      item.itemType || item.category,
      item.building,
      item.department,
      item.room,
      `"${(item.assignedTo || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(item.assignedRole || '').replace(/"/g, '""')}"`,
      item.quantity || 1,
      item.condition,
      item.status,
      item.purchaseDate,
      item.cost,
      `"${(item.supplier || '').replace(/"/g, '""')}"`,
      item.warranty,
      `"${(item.description || '').replace(/"/g, '""')}"`
    ]);

    // Construct CSV content with BOM (\uFEFF) for Excel UTF-8 encoding compatibility
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `asset_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <TopBar title="Asset Inventory" subtitle={`${filteredList.length} assets tracked across campus`} user={currentUser} />

      {/* Real-time Automated Notification Feedback Banner */}
      {conditionFeedback && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3 shadow-sm animate-fade-in">
          <div className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                Asset Condition Updated & Automated Notifications Dispatched
              </h4>
              <button
                onClick={() => setConditionFeedback(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-0.5">
              Condition for <strong className="font-mono">{conditionFeedback.assetId}</strong> ({conditionFeedback.assetName}) changed from <span className="font-bold underline">{conditionFeedback.prev}</span> to <span className="font-bold underline">{conditionFeedback.next}</span> by {conditionFeedback.editorRole}.
            </p>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              ✓ Automated Notifications dispatched to: <strong className="text-indigo-900 dark:text-indigo-100">{conditionFeedback.targetRole}</strong> via Email, WhatsApp & In-App.
            </p>
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, name, room, or custodian person..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            {['All', 'Available', 'In Use', 'Needs Inspection', 'Retired'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={filterCond}
            onChange={e => setFilterCond(e.target.value)}
            className="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            {['All', 'Good', 'Fair', 'Poor', 'Damaged'].map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Conditions' : c}</option>
            ))}
          </select>

          {/* Recently Viewed Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyRecent(!onlyRecent)}
            className={`px-3 py-2 text-xs rounded-xl border font-bold flex items-center gap-1.5 transition cursor-pointer ${onlyRecent
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            title="Filter by recently accessed assets"
          >
            <History size={13} className={onlyRecent ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'} />
            <span>Recent ({recentItems.length})</span>
          </button>

          {/* Actions */}
          <Btn onClick={() => navigate('/assets/new')}>
            <Icon.Plus /> Add Asset
          </Btn>
          <Btn variant="secondary" onClick={handleExport}>
            <Icon.Download /> Export CSV
          </Btn>
          <Btn variant="secondary" onClick={() => navigate('/category')}>
            <Layers className="w-4 h-4" /> Category Locator
          </Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                <th className="px-5 py-4 w-28">Asset ID</th>
                <th className="pl-5 pr-3 py-4 max-w-[100px]">Name & Type</th>
                <th className="px-3 py-4">Category</th>
                <th className="px-4 py-4">Location</th>
                <th className="px-4 py-4">Custodian</th>
                <th className="px-3 py-4 text-center">Qty</th>
                <th className="px-4 py-4">Condition</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No assets found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map(f => (
                  <tr
                    key={f.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150 cursor-pointer"
                    onClick={() => {
                      recordRecentAccess(f);
                      navigate(`/assets/${f.id}`);
                    }}
                  >
                    <td className="px-5 py-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{f.id}</td>
                    <td className="pl-5 pr-3 py-4 max-w-[300px]">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{f.name}</span>
                        {f.itemType && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{f.itemType}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                        {f.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">Room {f.room}</p>
                          <p className="text-[10px] text-slate-400">{f.building}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{f.assignedTo || 'Unassigned'}</p>
                          {f.assignedRole && (
                            <p className="text-[10px] text-violet-600 dark:text-violet-400">{f.assignedRole}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-bold text-center font-mono">{f.quantity || 1}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => handleOpenConditionModal(e, f)}
                        className="group inline-flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer"
                        title="Click to edit condition state (triggers email intimation)"
                      >
                        <Badge label={f.condition} type="condition" />
                        <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 opacity-60 group-hover:opacity-100 transition" />
                      </button>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap"><Badge label={f.status} /></td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            recordRecentAccess(f);
                            navigate(`/assets/${f.id}`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                          title="View Details"
                        >
                          <Icon.Eye />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assets/edit/${f.id}`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                          title="Edit"
                        >
                          <Icon.Edit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(f.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                          title="Delete"
                        >
                          <Icon.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>Showing {filteredList.length} of {sourceList.length} assets</span>
          <button
            onClick={() => navigate('/category')}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Open Category & Custodian Locator →
          </button>
        </div>
      </Card>

      {/* QUICK CONDITION UPDATE MODAL */}
      {conditionModalAsset && (
        <Modal
          title={`Update Asset Condition`}
          onClose={() => setConditionModalAsset(null)}
        >
          <form onSubmit={handleSaveCondition} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{conditionModalAsset.id}</span>
                <span className="text-xs text-slate-500 font-medium">{conditionModalAsset.department}</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{conditionModalAsset.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Location: Room {conditionModalAsset.room} ({conditionModalAsset.building})</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Current Condition State
              </label>
              <div className="flex items-center gap-2 mb-3">
                <Badge label={conditionModalAsset.condition || 'Good'} type="condition" />
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

            {/* AUTOMATED INTIMATION DIRECTIVE */}
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
                    As <strong>Super Admin</strong>, editing this condition will immediately dispatch an intimation email strictly to the respective <strong>Department Admin ({conditionModalAsset.department})</strong>.
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" type="button" onClick={() => setConditionModalAsset(null)}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={newConditionVal === conditionModalAsset.condition}>
                Update Condition & Send Intimation
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <Modal title="Confirm Asset Deletion" onClose={() => setDeleteId(null)}>
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
              <Icon.Trash />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold mb-1">Are you sure you want to delete</p>
            <p className="font-extrabold text-slate-800 dark:text-white mb-6 font-display">{deleteId}?</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
              This action cannot be undone. It will remove the asset from current logs.
            </p>
            <div className="flex gap-3 justify-center">
              <Btn variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => handleDelete(deleteId)}>Delete Asset</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
