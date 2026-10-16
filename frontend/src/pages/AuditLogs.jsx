import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Icon } from '../components/UIComponents';
import { ShieldCheck, Search, Filter, History, User, Activity, Clock } from 'lucide-react';
import { api } from '../api';

export const AuditLogs = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(150);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchAction = actionFilter === 'All' || log.action === actionFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' ||
        (log.userName && log.userName.toLowerCase().includes(q)) ||
        (log.entity && log.entity.toLowerCase().includes(q)) ||
        (log.entityId && log.entityId.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q));
      return matchAction && matchSearch;
    });
  }, [logs, actionFilter, searchQuery]);

  const actionBadgeColors = {
    'CREATE': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    'UPDATE': 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50',
    'DELETE': 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    'TRANSFER': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    'INSPECT': 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/50',
    'DISPOSE': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-12">
      <TopBar title="Security & Compliance Audit Trail" subtitle="Chronological history of all platform events, mutations, and custody changes" user={currentUser} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by user, asset ID, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="INSPECT">INSPECT</option>
            <option value="DISPOSE">DISPOSE</option>
          </select>
        </div>

        <button
          onClick={loadAuditLogs}
          className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
        >
          <History size={14} /> Refresh Logs
        </button>
      </div>

      {/* Audit Log Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">Details & Mutation Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading audit trail...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No audit records found matching criteria.</td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const dateStr = log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border font-mono ${actionBadgeColors[log.action] || 'bg-slate-100 text-slate-700'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {log.userName || 'System'}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 capitalize font-medium">
                        {log.userRole || 'Automated'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        <span>{log.entity}</span>
                        {log.entityId && (
                          <span className="ml-1 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">({log.entityId})</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default AuditLogs;
