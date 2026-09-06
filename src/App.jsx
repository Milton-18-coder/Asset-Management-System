import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/authSlice';
import { fetchAssetsFromSupabase, addFurniture, editFurniture, deleteFurniture } from './store/furnitureSlice';
import { fetchNotificationsFromSupabase, addNotification } from './store/notificationsSlice';
import { supabase } from './lib/supabaseClient';
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

  // 1. Fetch initial data from Supabase on application load
  useEffect(() => {
    dispatch(fetchAssetsFromSupabase());
    dispatch(fetchNotificationsFromSupabase());
  }, [dispatch]);

  // 2. Setup Realtime subscription to live sync updates across all devices/tabs
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'assets' },
        (payload) => {
          if (payload.new) {
            dispatch(addFurniture({
              id: payload.new.code || `AST-${payload.new.id}`,
              name: payload.new.name,
              category: payload.new.category,
              building: payload.new.building || 'Main Block',
              department: payload.new.department,
              room: payload.new.room,
              condition: payload.new.condition,
              status: payload.new.status,
              purchaseDate: payload.new.purchase_date,
              cost: Number(payload.new.cost || 0),
              supplier: payload.new.supplier,
              warranty: payload.new.warranty,
              quantity: Number(payload.new.quantity || 1),
              description: payload.new.description,
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'assets' },
        (payload) => {
          if (payload.new) {
            dispatch(editFurniture({
              id: payload.new.code || `AST-${payload.new.id}`,
              name: payload.new.name,
              category: payload.new.category,
              building: payload.new.building || 'Main Block',
              department: payload.new.department,
              room: payload.new.room,
              condition: payload.new.condition,
              status: payload.new.status,
              purchaseDate: payload.new.purchase_date,
              cost: Number(payload.new.cost || 0),
              supplier: payload.new.supplier,
              warranty: payload.new.warranty,
              quantity: Number(payload.new.quantity || 1),
              description: payload.new.description,
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'assets' },
        (payload) => {
          if (payload.old?.code) {
            dispatch(deleteFurniture(payload.old.code));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.new) {
            dispatch(addNotification({
              id: `NOTIF-${payload.new.id}`,
              title: payload.new.title,
              message: payload.new.message,
              type: payload.new.type || 'info',
              department: payload.new.department || 'All',
              read: Boolean(payload.new.is_read),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
