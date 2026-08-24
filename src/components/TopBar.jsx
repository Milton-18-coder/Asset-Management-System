import React from 'react';
import { Icon } from './UIComponents';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const TopBar = ({ title, subtitle, user }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 cursor-pointer"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 cursor-pointer">
          <Icon.Bell />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 transition duration-300">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
            {user.avatar}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 truncate max-w-[120px]">
              {user.department}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
