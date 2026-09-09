import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { deleteFurniture } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Modal, Icon } from '../components/UIComponents';
import { MapPin, User, Search, Layers } from 'lucide-react';

export const FurnitureList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState(searchParams.get('category') || 'All');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'All');
  const [filterCond, setFilterCond] = useState(searchParams.get('condition') || 'All');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const condition = searchParams.get('condition');
    const category = searchParams.get('category');
    if (status) setFilterStatus(status);
    if (condition) setFilterCond(condition);
    if (category) setFilterCat(category);
  }, [searchParams]);

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
    return sourceList.filter(f => {
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
  }, [search, filterCat, filterStatus, filterCond, sourceList]);

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
    link.setAttribute('download', `asset_inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <TopBar title="Asset Inventory" subtitle={`${filteredList.length} assets tracked across campus`} user={currentUser} />

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
                {['Asset ID', 'Name & Type', 'Category', 'Location (Where?)', 'Custodian (Whom?)', 'Qty', 'Condition', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
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
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                    <td className="px-5 py-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{f.id}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{f.name}</span>
                        {f.itemType && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{f.itemType}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                        {f.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
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
                    <td className="px-5 py-4 whitespace-nowrap"><Badge label={f.condition} type="condition" /></td>
                    <td className="px-5 py-4 whitespace-nowrap"><Badge label={f.status} /></td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => navigate(`/assets/${f.id}`)} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" 
                          title="View Details"
                        >
                          <Icon.Eye />
                        </button>
                        <button 
                          onClick={() => navigate(`/assets/edit/${f.id}`)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" 
                          title="Edit"
                        >
                          <Icon.Edit />
                        </button>
                        <button 
                          onClick={() => setDeleteId(f.id)} 
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
