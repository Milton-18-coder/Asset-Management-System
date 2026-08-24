import React, { useState } from 'react';
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

export default function App() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  
  const [page, setPage] = useState('dashboard');
  const [selectedFurniture, setSelectedFurniture] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    setPage('dashboard');
  };

  const clearSelectedFurniture = () => {
    setSelectedFurniture(null);
  };

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard setPage={setPage} setSelectedFurniture={setSelectedFurniture} />;
      case 'furniture-list':
        return <FurnitureList setPage={setPage} setSelectedFurniture={setSelectedFurniture} />;
      case 'furniture-add':
        return (
          <AddFurniture
            setPage={setPage}
            selectedFurniture={selectedFurniture}
            clearSelectedFurniture={clearSelectedFurniture}
          />
        );
      case 'furniture-detail':
        return <FurnitureDetail furniture={selectedFurniture} setPage={setPage} />;
      case 'category':
        return <CategoryPage />;
      case 'buildings':
        return currentUser.role === 'superadmin' ? <Buildings /> : null;
      case 'departments':
        return currentUser.role === 'superadmin' ? <Departments /> : null;
      case 'rooms':
        return <Rooms />;
      case 'transfers':
        return <Transfers />;
      case 'inspections':
        return <Inspections />;
      case 'users':
        return currentUser.role === 'superadmin' ? <Users /> : null;
      case 'settings':
        return currentUser.role === 'superadmin' ? <Settings /> : null;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setPage={setPage} setSelectedFurniture={setSelectedFurniture} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950/20 overflow-hidden transition-colors duration-300">
      <Sidebar
        user={currentUser}
        currentPage={page}
        setPage={setPage}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-[1280px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
