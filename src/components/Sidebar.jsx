import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from './UIComponents';

export const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campusOpen, setCampusOpen] = useState(true);
  const [furnitureOpen, setFurnitureOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const isSuperAdmin = user?.role === 'superadmin';

  const isNavActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (path === '/assets') {
      return location.pathname === '/assets' || (location.pathname.startsWith('/assets/') && location.pathname !== '/assets/new');
    }
    return location.pathname === path;
  };

  const navItem = (path, label, icon, indent = false) => {
    const active = isNavActive(path);
    return (
      <button
        key={path}
        onClick={() => navigate(path)}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
          indent ? 'ml-4 w-[calc(100%-1rem)]' : ''
        } ${
          active
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className={active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
          {icon}
        </span>
        {label}
      </button>
    );
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 fixed left-0 top-0 z-40 transition-colors duration-300">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white font-display tracking-tight">AssetMS</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">National Engineering College</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItem('/dashboard', 'Dashboard', <Icon.Dashboard />)}

        {/* Assets */}
        <button
          onClick={() => setFurnitureOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          <span>Assets</span>
          <span className={`transition-transform duration-200 ${furnitureOpen ? 'rotate-180' : ''}`}><Icon.ChevronDown /></span>
        </button>
        {furnitureOpen && (
          <div className="space-y-1 mt-1">
            {navItem('/assets', 'All Assets', <Icon.Furniture />)}
            {navItem('/assets/new', 'Add Asset', <Icon.Plus />)}
            {navItem('/category', 'Category', <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>)}
          </div>
        )}

        {/* Campus */}
        <button
          onClick={() => setCampusOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          <span>Campus</span>
          <span className={`transition-transform duration-200 ${campusOpen ? 'rotate-180' : ''}`}><Icon.ChevronDown /></span>
        </button>
        {campusOpen && (
          <div className="space-y-1 mt-1">
            {isSuperAdmin && navItem('/buildings', 'Buildings', <Icon.Building />)}
            {isSuperAdmin && navItem('/departments', 'Departments', <Icon.Department />)}
            {navItem('/rooms', 'Rooms', <Icon.Room />)}
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-1">
          {navItem('/transfers', 'Transfers', <Icon.Transfer />)}
          {navItem('/inspections', 'Inspections', <Icon.Inspection />)}
        </div>

        {/* Administration — Super Admin only */}
        {isSuperAdmin && (
          <>
            <button
              onClick={() => setAdminOpen(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              <span>Administration</span>
              <span className={`transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`}><Icon.ChevronDown /></span>
            </button>
            {adminOpen && (
              <div className="space-y-1 mt-1">
                {navItem('/users', 'Users', <Icon.Users />)}
                {navItem('/settings', 'Settings', <Icon.Settings />)}
              </div>
            )}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-4">
        <button
          onClick={() => navigate('/profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer mb-2 ${
            location.pathname === '/profile' ? 'bg-slate-100 dark:bg-slate-800' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
            {user?.avatar || 'U'}
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1 font-medium capitalize">
              {user?.role === 'superadmin' ? 'Super Admin' : 'Dept Admin'}
            </p>
          </div>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold transition-all cursor-pointer"
        >
          <Icon.Logout /> Sign Out
        </button>
      </div>
    </aside>
  );
};
