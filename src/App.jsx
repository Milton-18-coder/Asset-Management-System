import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/authSlice';
import { setFurnitureList } from './store/furnitureSlice';
import { setTransfersList } from './store/transfersSlice';
import { setInspectionsList } from './store/inspectionsSlice';
import { setUsersList } from './store/usersSlice';
import { setNotificationsList } from './store/notificationsSlice';
import { api } from './api';
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

  // Synchronize with MySQL database on mount
  useEffect(() => {
    async function syncDatabase() {
      try {
        const [assets, transfers, inspections, users, notifications] = await Promise.allSettled([
          api.getAssets(),
          api.getTransfers(),
          api.getInspections(),
          api.getUsers(),
          api.getNotifications(),
        ]);

        if (assets.status === 'fulfilled' && Array.isArray(assets.value) && assets.value.length > 0) {
          dispatch(setFurnitureList(assets.value));
        }
        if (transfers.status === 'fulfilled' && Array.isArray(transfers.value) && transfers.value.length > 0) {
          dispatch(setTransfersList(transfers.value));
        }
        if (inspections.status === 'fulfilled' && Array.isArray(inspections.value) && inspections.value.length > 0) {
          dispatch(setInspectionsList(inspections.value));
        }
        if (users.status === 'fulfilled' && Array.isArray(users.value) && users.value.length > 0) {
          dispatch(setUsersList(users.value));
        }
        if (notifications.status === 'fulfilled' && Array.isArray(notifications.value) && notifications.value.length > 0) {
          dispatch(setNotificationsList(notifications.value));
        }
      } catch (err) {
        console.warn('Backend sync warning (fallback to local state):', err.message);
      }
    }

    syncDatabase();
  }, [dispatch]);

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
