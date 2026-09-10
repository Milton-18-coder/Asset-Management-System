import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Badge, Icon } from '../components/UIComponents';
import { Wrench, CheckCircle2, Clock, AlertTriangle, XCircle, Plus, Search, Filter, DollarSign, User } from 'lucide-react';
import { api } from '../api';

export const Maintenance = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list) || [];
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showSchedule, setShowSchedule] = useState(false);
  const [showResolve, setShowResolve] = useState(null);
  
  const [scheduleForm, setScheduleForm] = useState({
    assetId: '',
    furniture: '',
    issueDescription: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    cost: 0,
    vendor: '',
    status: 'Scheduled',
    technicianNotes: '',
  });

  const [resolveForm, setResolveForm] = useState({
    status: 'Completed',
    completedDate: new Date().toISOString().split('T')[0],
    technicianNotes: '',
    cost: 0,
  });

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const data = await api.getMaintenanceLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load maintenance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  const handleAssetSelect = (e) => {
    const selectedId = e.target.value;
    const asset = furnitureList.find(f => f.id === selectedId);
    setScheduleForm({
      ...scheduleForm,
      assetId: selectedId,
      furniture: asset ? asset.name : '',
    });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.issueDescription) return;
    try {
      await api.addMaintenanceLog(scheduleForm);
      setShowSchedule(false);
      setScheduleForm({
        assetId: '',
        furniture: '',
        issueDescription: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        cost: 0,
        vendor: '',
        status: 'Scheduled',
        technicianNotes: '',
      });
      await loadMaintenance();
    } catch (err) {
      alert('Error scheduling maintenance: ' + err.message);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!showResolve) return;
    try {
      await api.updateMaintenanceStatus(showResolve.id, resolveForm);
      setShowResolve(null);
      await loadMaintenance();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      await api.deleteMaintenanceLog(id);
      await loadMaintenance();
    } catch (err) {
      alert('Error deleting record: ' + err.message);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchSearch = searchQuery === '' ||
        (l.furniture && l.furniture.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.assetId && l.assetId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.vendor && l.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.issueDescription && l.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [logs, statusFilter, searchQuery]);

  const metrics = useMemo(() => {
    const total = logs.length;
    const scheduled = logs.filter(l => l.status === 'Scheduled').length;
    const inProgress = logs.filter(l => l.status === 'In Progress').length;
    const completed = logs.filter(l => l.status === 'Completed').length;
    const totalCost = logs.reduce((sum, l) => sum + (parseFloat(l.cost) || 0), 0);
    return { total, scheduled, inProgress, completed, totalCost };
  }, [logs]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-12">
      <TopBar title="Maintenance & Service Tracker" subtitle="Manage repairs, servicing, and AMC upkeep" user={currentUser} />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white font-display">{metrics.scheduled}</p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Scheduled</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Wrench size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white font-display">{metrics.inProgress}</p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">In Progress</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white font-display">{metrics.completed}</p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Completed</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white font-display font-mono">₹{metrics.totalCost.toLocaleString('en-IN')}</p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Repair Cost</p>
          </div>
        </Card>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search maintenance logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <Btn onClick={() => setShowSchedule(true)} className="w-full sm:w-auto">
          <Plus size={16} /> Schedule Maintenance
        </Btn>
      </div>

      {/* Maintenance Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                <th className="px-5 py-4">Asset / Equipment</th>
                <th className="px-5 py-4">Issue Description</th>
                <th className="px-5 py-4">Scheduled Date</th>
                <th className="px-5 py-4">Vendor / Technician</th>
                <th className="px-5 py-4">Cost</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading maintenance records...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No maintenance records found.</td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const statusColors = {
                    'Scheduled': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
                    'In Progress': 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50',
                    'Completed': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
                    'Cancelled': 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                      <td className="px-5 py-4 font-medium">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{log.furniture || 'Custom Equipment'}</p>
                        {log.assetId && (
                          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{log.assetId}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-xs text-slate-600 dark:text-slate-300">
                        <p className="line-clamp-2">{log.issueDescription}</p>
                        {log.technicianNotes && (
                          <p className="text-[10px] text-slate-400 mt-0.5 italic">Note: {log.technicianNotes}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.scheduledDate ? new Date(log.scheduledDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {log.vendor || 'In-House Maintenance'}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        ₹{parseFloat(log.cost || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${statusColors[log.status] || 'bg-slate-100 text-slate-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        {log.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              setShowResolve(log);
                              setResolveForm({
                                status: log.status === 'Scheduled' ? 'In Progress' : 'Completed',
                                completedDate: new Date().toISOString().split('T')[0],
                                technicianNotes: log.technicianNotes || '',
                                cost: log.cost || 0,
                              });
                            }}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold rounded-lg transition"
                          >
                            Update Status
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete record"
                        >
                          <Icon.Trash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule Maintenance Modal */}
      {showSchedule && (
        <Modal title="Schedule Maintenance / Service Request" onClose={() => setShowSchedule(false)}>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Select Asset (Optional)</label>
              <select
                value={scheduleForm.assetId}
                onChange={handleAssetSelect}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Manual / Unregistered Equipment --</option>
                {furnitureList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.id}) - {f.department} / {f.room}</option>
                ))}
              </select>
            </div>

            <Input
              label="Equipment Name *"
              placeholder="e.g. LCD Projector"
              value={scheduleForm.furniture}
              onChange={(e) => setScheduleForm({ ...scheduleForm, furniture: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Issue Description *</label>
              <textarea
                rows={3}
                placeholder="Describe the defect, malfunctioning part, or required service..."
                value={scheduleForm.issueDescription}
                onChange={(e) => setScheduleForm({ ...scheduleForm, issueDescription: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Scheduled Date"
                type="date"
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
              />
              <Input
                label="Estimated Cost (₹)"
                type="number"
                value={scheduleForm.cost}
                onChange={(e) => setScheduleForm({ ...scheduleForm, cost: parseFloat(e.target.value || '0') })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Assigned Vendor / Agency"
                placeholder="e.g. Apex AV Solutions"
                value={scheduleForm.vendor}
                onChange={(e) => setScheduleForm({ ...scheduleForm, vendor: e.target.value })}
              />
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Initial Status</label>
                <select
                  value={scheduleForm.status}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" type="button" onClick={() => setShowSchedule(false)}>Cancel</Btn>
              <Btn type="submit">Schedule Request</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* Resolve / Update Status Modal */}
      {showResolve && (
        <Modal title={`Update Maintenance Status — ${showResolve.furniture}`} onClose={() => setShowResolve(null)}>
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select
                value={resolveForm.status}
                onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed (Restores Asset to Good Condition)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {resolveForm.status === 'Completed' && (
              <Input
                label="Completion Date"
                type="date"
                value={resolveForm.completedDate}
                onChange={(e) => setResolveForm({ ...resolveForm, completedDate: e.target.value })}
              />
            )}

            <Input
              label="Final / Incurred Cost (₹)"
              type="number"
              value={resolveForm.cost}
              onChange={(e) => setResolveForm({ ...resolveForm, cost: parseFloat(e.target.value || '0') })}
            />

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Technician Notes & Parts Replaced</label>
              <textarea
                rows={3}
                placeholder="Details of repair work, parts replaced, warranty terms..."
                value={resolveForm.technicianNotes}
                onChange={(e) => setResolveForm({ ...resolveForm, technicianNotes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" type="button" onClick={() => setShowResolve(null)}>Cancel</Btn>
              <Btn type="submit">Save Update</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default Maintenance;
