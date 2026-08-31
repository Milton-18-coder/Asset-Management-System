import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteFurniture } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Modal, Icon } from '../components/UIComponents';

export const FurnitureList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCond, setFilterCond] = useState('All');
  const [deleteId, setDeleteId] = useState(null);

  if (!currentUser) return null;

  // Filter list by role (dept admin only sees their own dept)
  const sourceList = useMemo(() => {
    if (currentUser.role === 'superadmin') return furnitureList;
    return furnitureList.filter(f => f.department === currentUser.department);
  }, [furnitureList, currentUser]);

  // Categories list for dropdown
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(sourceList.map(f => f.category)))];
  }, [sourceList]);

  // Search & Filter algorithm
  const filteredList = useMemo(() => {
    return sourceList.filter(f => {
      const q = search.toLowerCase();
      const matchSearch = 
        !q || 
        f.id.toLowerCase().includes(q) || 
        f.name.toLowerCase().includes(q) || 
        f.room.toLowerCase().includes(q) ||
        f.building.toLowerCase().includes(q);
      const matchCat = filterCat === 'All' || f.category === filterCat;
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
    const headers = ['Asset ID', 'Name', 'Category', 'Building', 'Department', 'Room', 'Qty', 'Condition', 'Status', 'Purchase Date', 'Cost', 'Supplier', 'Warranty', 'Description'];
    
    // Map assets to CSV rows
    const rows = filteredList.map(item => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.category,
      item.building,
      item.department,
      item.room,
      item.quantity,
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
    <div>
      <TopBar title="All Assets" subtitle={`${filteredList.length} assets found`} user={currentUser} />

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon.Search /></span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Asset ID, name, location..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-805 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
          </div>

          {/* Category Filter */}
          <select 
            value={filterCat} 
            onChange={e => setFilterCat(e.target.value)} 
            className="px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>

          {/* Status Filter */}
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            className="px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            {['All', 'Available', 'In Use', 'Needs Inspection', 'Retired'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>

          {/* Condition Filter */}
          <select 
            value={filterCond} 
            onChange={e => setFilterCond(e.target.value)} 
            className="px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
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
            <Icon.Download /> Export
          </Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {['Asset ID', 'Name', 'Category', 'Building', 'Room', 'Qty', 'Condition', 'Status', 'Purchased', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No assets found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                    <td className="px-5 py-4.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{f.id}</td>
                    <td className="px-5 py-4.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{f.name}</td>
                    <td className="px-5 py-4.5 text-slate-550 dark:text-slate-400 font-semibold">{f.category}</td>
                    <td className="px-5 py-4.5 text-slate-550 dark:text-slate-400 font-semibold whitespace-nowrap">{f.building}</td>
                    <td className="px-5 py-4.5 text-slate-550 dark:text-slate-400 font-semibold">{f.room}</td>
                    <td className="px-5 py-4.5 text-slate-700 dark:text-slate-300 font-bold text-center">{f.quantity}</td>
                    <td className="px-5 py-4.5"><Badge label={f.condition} type="condition" /></td>
                    <td className="px-5 py-4.5"><Badge label={f.status} /></td>
                    <td className="px-5 py-4.5 text-slate-500 font-semibold whitespace-nowrap">{f.purchaseDate}</td>
                    <td className="px-5 py-4.5">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => navigate(`/assets/${f.id}`)} 
                          className="p-1.5 text-slate-455 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" 
                          title="View Details"
                        >
                          <Icon.Eye />
                        </button>
                        <button 
                          onClick={() => navigate(`/assets/edit/${f.id}`)}
                          className="p-1.5 text-slate-455 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" 
                          title="Edit"
                        >
                          <Icon.Edit />
                        </button>
                        <button 
                          onClick={() => setDeleteId(f.id)} 
                          className="p-1.5 text-slate-455 hover:text-rose-600 dark:hover:text-rose-455 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" 
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

        <div className="px-5 py-4.5 border-t border-slate-100 dark:border-slate-855 text-xs font-semibold text-slate-400 dark:text-slate-550 flex items-center justify-between">
          <span>Showing {filteredList.length} of {sourceList.length} assets</span>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <Modal title="Confirm Asset Deletion" onClose={() => setDeleteId(null)}>
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
              <Icon.Trash />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-350 font-semibold mb-1">Are you sure you want to delete</p>
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
