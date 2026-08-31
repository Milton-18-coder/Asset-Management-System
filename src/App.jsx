import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/authSlice';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FurnitureList } from './pages/FurnitureList';
import { AddFurniture } from './pages/AddFurniture';
import { FurnitureDetail } from './pages/FurnitureDetail';
import { CategoryPage } from './pages/CategoryPage';
import { Buildings } from './pages/Buildings';
import { Departments } from './pages/Departments';
import { Rooms } from './pages/Rooms';
import { Transfers } from './pages/Transfers';
import { Inspections } from './pages/Inspections';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { NotificationsPage } from './pages/NotificationsPage';

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isSuperAdmin = currentUser.role === 'superadmin';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950/20 overflow-hidden transition-colors duration-300">
      <Sidebar
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-[1280px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/assets" element={<FurnitureList />} />
            <Route path="/assets/new" element={<AddFurniture />} />
            <Route path="/assets/edit/:id" element={<AddFurniture />} />
            <Route path="/assets/:id" element={<FurnitureDetail />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/buildings" element={isSuperAdmin ? <Buildings /> : <Navigate to="/dashboard" replace />} />
            <Route path="/departments" element={isSuperAdmin ? <Departments /> : <Navigate to="/dashboard" replace />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/users" element={isSuperAdmin ? <Users /> : <Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={isSuperAdmin ? <Settings /> : <Navigate to="/dashboard" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
