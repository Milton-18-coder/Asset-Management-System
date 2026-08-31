import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  addNotification,
} from '../store/notificationsSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Icon } from '../components/UIComponents';
import { CheckCheck, Trash2, ArrowRight, Bell, Filter } from 'lucide-react';

export const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const notificationsList = useSelector((state) => state.notifications.list);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'transfer' | 'inspection' | 'asset'
  const [search, setSearch] = useState('');

  // Scoped notifications
  const userNotifications = useMemo(() => {
    if (!currentUser) return notificationsList;
    if (currentUser.role === 'superadmin') return notificationsList;
    return notificationsList.filter(
      (n) => !n.department || n.department === currentUser.department || n.department === 'All'
    );
  }, [notificationsList, currentUser]);

  const filteredNotifications = useMemo(() => {
    return userNotifications.filter((n) => {
      const matchTab =
        activeTab === 'all'
          ? true
          : activeTab === 'unread'
          ? !n.read
          : n.type === activeTab;
      const matchSearch =
        !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [userNotifications, activeTab, search]);

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleCreateDemoNotification = () => {
    dispatch(
      addNotification({
        title: 'System Audit Broadcast',
        message: `Quarterly institutional physical asset audit initiated by ${currentUser?.name || 'Administrator'}.`,
        type: 'system',
        link: '/inspections',
        department: currentUser?.department || 'Administration',
      })
    );
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'transfer':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">Transfer</span>;
      case 'inspection':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Inspection</span>;
      case 'warranty':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Warranty</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Asset</span>;
    }
  };

  return (
    <div>
      <TopBar
        title="Activity Notifications"
        subtitle={`${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''} across your department`}
        user={currentUser}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${userNotifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'transfer', label: 'Transfers' },
            { id: 'inspection', label: 'Inspections' },
            { id: 'asset', label: 'Assets' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Btn variant="secondary" size="sm" onClick={handleCreateDemoNotification}>
            <Bell size={14} /> Send Audit Notice
          </Btn>
          {userNotifications.length > 0 && (
            <>
              <Btn variant="secondary" size="sm" onClick={() => dispatch(markAllAsRead())}>
                <CheckCheck size={14} /> Mark all read
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => dispatch(clearAllNotifications())}>
                <Trash2 size={14} /> Clear all
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Notifications Card List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/40">
              <Icon.Check />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 font-display">No Notifications</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              There are no notifications matching your active filter. Any newly registered assets, transfers, or condition inspections will show up here in real-time.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <Card
              key={n.id}
              className={`p-5 transition duration-200 border-2 ${
                !n.read
                  ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">
                    {getTypeBadge(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${!n.read ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'} font-display`}>
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>{n.timestamp}</span>
                      {n.department && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {n.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  {n.link && (
                    <button
                      onClick={() => {
                        if (!n.read) dispatch(markAsRead(n.id));
                        navigate(n.link);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      View details <ArrowRight size={13} />
                    </button>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => dispatch(markAsRead(n.id))}
                      className="p-1.5 text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(deleteNotification(n.id))}
                    className="p-1.5 text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
