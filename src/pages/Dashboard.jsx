import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { markAsRead } from '../store/notificationsSlice';
import { TopBar } from '../components/TopBar';
import { StatCard, Card, Badge, Btn, Icon } from '../components/UIComponents';
import { DonutChart, BarChart } from '../components/Charts';
import { Bell, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);
  const transfersList = useSelector((state) => state.transfers.list);
  const notificationsList = useSelector((state) => state.notifications?.list || []);

  if (!currentUser) return null;

  const isSuperAdmin = currentUser.role === 'superadmin';

  // Filter assets by department if not superadmin
  const deptFurniture = useMemo(() => {
    if (isSuperAdmin) return furnitureList;
    return furnitureList.filter(f => f.department === currentUser.department);
  }, [furnitureList, isSuperAdmin, currentUser.department]);

  // Scoped notifications for dashboard widget
  const recentNotifications = useMemo(() => {
    const scoped = isSuperAdmin
      ? notificationsList
      : notificationsList.filter(n => !n.department || n.department === currentUser.department || n.department === 'All');
    return scoped.slice(0, 4);
  }, [notificationsList, isSuperAdmin, currentUser.department]);

  // Compute metrics using useMemo
  const stats = useMemo(() => {
    const total = deptFurniture.reduce((s, f) => s + f.quantity, 0);
    const available = deptFurniture.filter(f => f.status === 'Available').reduce((s, f) => s + f.quantity, 0);
    const inUse = deptFurniture.filter(f => f.status === 'In Use').reduce((s, f) => s + f.quantity, 0);
    const needsInspection = deptFurniture.filter(f => f.status === 'Needs Inspection').reduce((s, f) => s + f.quantity, 0);
    return { total, available, inUse, needsInspection };
  }, [deptFurniture]);

  // Compute category chart data
  const categoryData = useMemo(() => {
    const categories = Array.from(new Set(deptFurniture.map(f => f.category)));
    return categories.map(c => ({
      label: c,
      value: deptFurniture.filter(f => f.category === c).reduce((s, f) => s + f.quantity, 0),
    }));
  }, [deptFurniture]);

  // Compute condition donut data
  const conditionDonut = useMemo(() => {
    const good = deptFurniture.filter(f => f.condition === 'Good').reduce((s, f) => s + f.quantity, 0);
    const fair = deptFurniture.filter(f => f.condition === 'Fair').reduce((s, f) => s + f.quantity, 0);
    const poor = deptFurniture.filter(f => f.condition === 'Poor').reduce((s, f) => s + f.quantity, 0);
    const damaged = deptFurniture.filter(f => f.condition === 'Damaged').reduce((s, f) => s + f.quantity, 0);
    return [
      { label: 'Good', value: good, color: '#10b981' },
      { label: 'Fair', value: fair, color: '#f59e0b' },
      { label: 'Poor', value: poor, color: '#f97316' },
      { label: 'Damaged', value: damaged, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [deptFurniture]);

  const recentTransfers = useMemo(() => {
    if (isSuperAdmin) return transfersList.slice(0, 4);
    return transfersList.filter(t => {
      const relatedAsset = furnitureList.find(f => f.id === t.assetId);
      return relatedAsset && relatedAsset.department === currentUser.department;
    }).slice(0, 4);
  }, [transfersList, furnitureList, isSuperAdmin, currentUser.department]);

  return (
    <div>
      <TopBar
        title={isSuperAdmin ? 'Super Admin Dashboard' : 'Department Dashboard'}
        subtitle={isSuperAdmin ? 'National Engineering College 2026 — Overview' : `${currentUser.department} Department — Overview`}
        user={currentUser}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Icon.Furniture />} 
          label="Total Assets" 
          value={stats.total} 
          sub="units recorded" 
          color="bg-indigo-50 border-indigo-150 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400" 
        />
        <StatCard 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} 
          label="Available" 
          value={stats.available} 
          sub="ready for use" 
          color="bg-emerald-50 border-emerald-150 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400" 
        />
        <StatCard 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} 
          label="In Use" 
          value={stats.inUse} 
          sub="currently assigned" 
          color="bg-violet-50 border-violet-150 text-violet-600 dark:bg-violet-950/20 dark:border-violet-900/50 dark:text-violet-400" 
        />
        <StatCard 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} 
          label="Needs Care" 
          value={stats.needsInspection} 
          sub="requires review" 
          color="bg-amber-50 border-amber-150 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400" 
        />
      </div>

      {/* Analytics & Activity Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex flex-col justify-between">
          <DonutChart data={conditionDonut} title="Asset Condition Summary" />
        </Card>
        
        <Card className="p-4 flex flex-col justify-between font-medium">
          <BarChart data={categoryData} title="Category Distribution" />
        </Card>
        
        {/* Recent Transfers Widget */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-display uppercase tracking-wide">Transfers</p>
              <button onClick={() => navigate('/transfers')} className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer">View all</button>
            </div>
            <div className="space-y-2.5">
              {recentTransfers.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No transfers.</p>
              ) : (
                recentTransfers.map(t => (
                  <div key={t.id} className="flex items-start justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">{t.furniture}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{t.source} → {t.destination}</p>
                    </div>
                    <Badge label={t.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Small Live Notifications Widget on Dashboard */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Bell size={13} className="text-indigo-600 dark:text-indigo-400" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-display uppercase tracking-wide">Alerts</p>
              </div>
              <button onClick={() => navigate('/notifications')} className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer">View all</button>
            </div>
            <div className="space-y-2">
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No recent alerts.</p>
              ) : (
                recentNotifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) dispatch(markAsRead(n.id));
                      if (n.link) navigate(n.link);
                    }}
                    className={`p-2 rounded-xl border transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      !n.read
                        ? 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-[11px] truncate ${!n.read ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Items Table */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="font-bold text-slate-800 dark:text-white font-display text-sm tracking-tight">Recent Assets</p>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/assets')}>View all</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {['Asset ID', 'Name', 'Category', 'Room', 'Condition', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {deptFurniture.slice(0, 5).map(f => (
                <tr 
                  key={f.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition cursor-pointer" 
                  onClick={() => navigate(`/assets/${f.id}`)}
                >
                  <td className="px-6 py-4.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{f.id}</td>
                  <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200">{f.name}</td>
                  <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-medium">{f.category}</td>
                  <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-medium">{f.room}</td>
                  <td className="px-6 py-4.5"><Badge label={f.condition} type="condition" /></td>
                  <td className="px-6 py-4.5"><Badge label={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
