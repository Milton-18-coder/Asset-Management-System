import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../store/notificationsSlice';
import { Icon } from './UIComponents';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, CheckCheck, Trash2, ArrowRight } from 'lucide-react';

export const TopBar = ({ title, subtitle, user: propUser }) => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifDropdownRef = useRef(null);

  const authUser = useSelector((state) => state.auth.currentUser);
  const user = propUser || authUser;

  const notificationsList = useSelector((state) => state.notifications?.list || []);
  const [openNotif, setOpenNotif] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Filter notifications by user role (superadmin sees all, deptadmin sees their own department + general)
  const notifications = useMemo(() => {
    if (!user) return notificationsList;
    if (user.role === 'superadmin') return notificationsList;
    return notificationsList.filter(n => !n.department || n.department === user.department || n.department === 'All');
  }, [notificationsList, user]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };
    if (openNotif) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [openNotif]);

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      dispatch(markAsRead(notif.id));
    }
    setOpenNotif(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'transfer':
        return (
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs">
            <Icon.Transfer />
          </div>
        );
      case 'inspection':
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 text-xs">
            <Icon.Inspection />
          </div>
        );
      case 'warranty':
        return (
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 text-xs">
            <Icon.Alert />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs">
            <Icon.Furniture />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 relative z-40">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-200 cursor-pointer shadow-sm"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Button & Dropdown Popover */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenNotif((prev) => !prev);
            }}
            className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition duration-200 cursor-pointer shadow-sm ${
              openNotif
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-500'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Toggle Notifications"
          >
            <Icon.Bell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Small Floating Notification Dropdown Widget */}
          {openNotif && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 dark:shadow-black/70 overflow-hidden z-50"
              style={{ minWidth: '280px' }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs font-display uppercase tracking-wide">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dispatch(markAllAsRead())}
                      className="px-2 py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck size={13} /> Mark read
                    </button>
                    <button
                      onClick={() => dispatch(clearAllNotifications())}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition cursor-pointer"
                      title="Clear all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 pt-2 bg-slate-50/40 dark:bg-slate-900/40 text-xs font-semibold">
                <button
                  onClick={() => setFilter('all')}
                  className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                    filter === 'all'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                    filter === 'unread'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayedNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Icon.Check />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">No notifications in this view.</p>
                  </div>
                ) : (
                  displayedNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 transition flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 relative ${
                        !n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/25' : ''
                      }`}
                    >
                      {getTypeIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-xs truncate ${!n.read ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteNotification(n.id));
                        }}
                        className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 p-1 rounded transition flex-shrink-0"
                        title="Delete"
                      >
                        <Icon.Cross />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* View all activity footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setOpenNotif(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  Open Full Activity Center <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 transition duration-200 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              {user.avatar || 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 truncate max-w-[120px]">
                {user.department}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
