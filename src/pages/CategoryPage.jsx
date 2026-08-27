import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Icon } from '../components/UIComponents';

const defaultCategories = [
  { id: 'C01', name: 'Desk', icon: '/images/desk.jpg', description: 'Writing and work desks for classrooms and offices', count: 0, color: 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50' },
  { id: 'C02', name: 'Chair', icon: '/images/chair.jpg', description: 'Student, faculty and ergonomic chairs', count: 0, color: 'bg-violet-50 border-violet-100 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50' },
  { id: 'C03', name: 'Table', icon: '/images/table.jpg', description: 'Conference, lab and general-purpose tables', count: 0, color: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50' },
  { id: 'C04', name: 'Board', icon: '/images/board.jpg', description: 'Whiteboards, blackboards and notice boards', count: 0, color: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' },
  { id: 'C05', name: 'Electronics', icon: '/images/electronics.jpg', description: 'Projectors, computers, smart boards and AV equipment', count: 0, color: 'bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50' },
  { id: 'C06', name: 'Storage', icon: '/images/storage.jpg', description: 'Filing cabinets, bookshelves and lockers', count: 0, color: 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/50' },
  { id: 'C07', name: 'Equipment', icon: '/images/equipment.jpg', description: 'Lab instruments, oscilloscopes and specialised tools', count: 0, color: 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50' },
  { id: 'C08', name: 'Other', icon: '/images/other.jpg', description: 'Miscellaneous assets not covered by other categories', count: 0, color: 'bg-slate-50 border-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50' },
];

export const CategoryPage = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);

  const [categories, setCategories] = useState(() =>
    defaultCategories.map(c => ({
      ...c,
      count: furnitureList.filter(f => f.category === c.name).reduce((s, f) => s + f.quantity, 0),
    }))
  );
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const colors = ['bg-teal-50 border-teal-100 text-teal-700 dark:bg-teal-950/20', 'bg-pink-50 border-pink-100 text-pink-700 dark:bg-pink-950/20', 'bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-950/20'];
    setCategories(prev => [...prev, {
      id: 'C' + String(prev.length + 1).padStart(2, '0'),
      name: newName.trim(),
      icon: '📦',
      description: newDesc.trim() || 'Custom asset category',
      count: 0,
      color: colors[prev.length % colors.length],
    }]);
    setNewName('');
    setNewDesc('');
    setShowAdd(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div>
      <TopBar title="Asset Categories" subtitle={`${categories.length} categories defined`} user={currentUser} />

      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl p-3.5 mb-4 font-semibold">
          <Icon.Check /> Category saved successfully.
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> Add Category</Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categories.map(c => (
          <Card key={c.id} className="p-5 border-2 border-slate-100 dark:border-slate-800 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border overflow-hidden ${c.color.split(' ')[0]}`}>
                {c.icon.startsWith('/') ? (
                  <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  c.icon
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditId(c.id === editId ? null : c.id)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <Icon.Edit />
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <Icon.Trash />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1.5 text-sm font-display">{c.name}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed min-h-[32px]">{c.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 font-semibold">
              <span className="text-xs text-slate-500">Total Units</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{c.count.toLocaleString()}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="font-bold text-slate-808 dark:text-white font-display text-sm tracking-tight">Category Table Overview</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
                {['ID', 'Category Name', 'Description', 'Total Units', 'Assets in Inventory', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {categories.map(c => {
                const assetCount = furnitureList.filter(f => f.category === c.name).length;
                return editId === c.id ? (
                  <tr key={c.id} className="bg-indigo-50/20 dark:bg-indigo-950/10">
                    <td className="px-5 py-4 font-mono text-slate-400 dark:text-slate-550">{c.id}</td>
                    <td className="px-5 py-4">
                      <input
                        defaultValue={c.name}
                        className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 dark:border-indigo-900 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        onBlur={e => setCategories(prev => prev.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))}
                      />
                    </td>
                    <td className="px-5 py-4" colSpan={2}>
                      <input
                        defaultValue={c.description}
                        className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 dark:border-indigo-900 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        onBlur={e => setCategories(prev => prev.map(x => x.id === c.id ? { ...x, description: e.target.value } : x))}
                      />
                    </td>
                    <td className="px-5 py-4 text-center font-bold">{c.count}</td>
                    <td className="px-5 py-4 text-center font-bold">{assetCount}</td>
                    <td className="px-5 py-4">
                      <Btn size="sm" onClick={() => { setEditId(null); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>Save</Btn>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td className="px-5 py-4 font-mono text-slate-400 dark:text-slate-550">{c.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs border overflow-hidden ${c.color.split(' ')[0]}`}>
                          {c.icon.startsWith('/') ? (
                            <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.icon
                          )}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium max-w-sm truncate">{c.description}</td>
                    <td className="px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-300">{c.count.toLocaleString()}</td>
                    <td className="px-5 py-4 text-center font-bold text-slate-660 dark:text-slate-450">{assetCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditId(c.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"><Icon.Edit /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"><Icon.Trash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <Modal title="Add Asset Category" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Input
              label="Category Name *"
              placeholder="e.g. Lab Equipment"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Description</label>
              <textarea
                rows={2}
                placeholder="Describe what items are included in this category..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={handleAdd} disabled={!newName.trim()}>Add Category</Btn>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete Category" onClose={() => setDeleteId(null)}>
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
              <Icon.Trash />
            </div>
            <p className="text-sm text-slate-705 dark:text-slate-350 font-semibold mb-1">Delete Category</p>
            <p className="font-extrabold text-slate-800 dark:text-white mb-4 font-display">"{categories.find(c => c.id === deleteId)?.name}"?</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Assets in this category will not be deleted, only the classification label is removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Btn variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
