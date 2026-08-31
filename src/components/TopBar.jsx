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

  const notificationsList = useSelector((state) => state.notifications.list);
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
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
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
          <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 text-[10px]">
            <Icon.Transfer />
          </div>
        );
      case 'inspection':
        return (
          <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px]">
            <Icon.Inspection />
          </div>
        );
      case 'warranty':
        return (
          <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 text-[10px]">
            <Icon.Alert />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px]">
            <Icon.Furniture />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 relative z-30">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 cursor-pointer shadow-sm"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Button & Compact Popover */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setOpenNotif(!openNotif)}
            className="relative w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 cursor-pointer shadow-sm"
            title="Notifications"
          >
            <Icon.Bell />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-rose-500 animate-ping opacity-75" />
              </>
            )}
          </button>

          {/* Small Compact Notification Popup */}
          {openNotif && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs font-display">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dispatch(markAllAsRead())}
                      className="px-2 py-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded font-bold flex items-center gap-0.5 transition cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck size={12} /> Read all
                    </button>
                    <button
                      onClick={() => dispatch(clearAllNotifications())}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition cursor-pointer"
                      title="Clear all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Notification List (Small Size) */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayedNotifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-1.5">
                      <Icon.Check />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">No new alerts.</p>
                  </div>
                ) : (
                  displayedNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 transition flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 relative ${
                        !n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {getTypeIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-[11px] truncate ${!n.read ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteNotification(n.id));
                        }}
                        className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 p-0.5 rounded transition"
                        title="Delete"
                      >
                        <Icon.Cross />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* View all footer */}
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setOpenNotif(false);
                    navigate('/notifications');
                  }}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  View all activity <ArrowRight size={11} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 transition duration-300 shadow-sm">
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
