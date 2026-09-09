import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Modal, Input, Select, Icon } from '../components/UIComponents';
import { 
  ASSET_CATEGORIES, 
  MAIN_CATEGORIES,
  getItemTypes
} from '../constants/assetCategories';
import { 
  updateFurnitureCustodian, 
  updateFurnitureLocation,
  bulkAssignCustodians,
  resetToDefaultCatalog
} from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { 
  Search, 
  MapPin, 
  User, 
  Layers, 
  Grid, 
  List, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2, 
  Users, 
  CheckSquare, 
  Square, 
  UserPlus, 
  RefreshCw, 
  Edit3, 
  Filter, 
  X, 
  Sparkles, 
  ChevronRight, 
  DoorOpen,
  ArrowRight
} from 'lucide-react';

export const CategoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);
  const usersList = useSelector((state) => state.users.list);

  // Tab mode: 'taxonomy' | 'custodians' | 'locations'
  const [activeTab, setActiveTab] = useState('taxonomy');

  // Hierarchy Selection
  const [selectedMainCat, setSelectedMainCat] = useState('All');
  const [selectedSubCat, setSelectedSubCat] = useState('All');
  const [selectedItemType, setSelectedItemType] = useState('All');

  // Filters
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedPerson, setSelectedPerson] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Multi-select for bulk custodian assignment
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCustodianName, setBulkCustodianName] = useState('');
  const [bulkCustodianRole, setBulkCustodianRole] = useState('Faculty In-Charge');
  const [bulkCustodianEmail, setBulkCustodianEmail] = useState('');

  // Single Asset Edit Modal
  const [editingAsset, setEditingAsset] = useState(null);
  const [editRoom, setEditRoom] = useState('');
  const [editBuilding, setEditBuilding] = useState('');
  const [editPerson, setEditPerson] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [successToast, setSuccessToast] = useState('');

  if (!currentUser) return null;

  // Scoped assets for role
  const sourceAssets = useMemo(() => {
    if (currentUser.role === 'superadmin') return furnitureList;
    return furnitureList.filter(f => f.department === currentUser.department);
  }, [furnitureList, currentUser]);

  // Unique lists for filters
  const uniqueRooms = useMemo(() => {
    return ['All', ...Array.from(new Set(sourceAssets.map(f => f.room).filter(Boolean))).sort()];
  }, [sourceAssets]);

  const uniquePeople = useMemo(() => {
    return ['All', ...Array.from(new Set(sourceAssets.map(f => f.assignedTo).filter(Boolean))).sort()];
  }, [sourceAssets]);

  // Filtered Assets based on user criteria
  const filteredAssets = useMemo(() => {
    return sourceAssets.filter((asset) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        asset.id.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        (asset.itemType && asset.itemType.toLowerCase().includes(q)) ||
        (asset.category && asset.category.toLowerCase().includes(q)) ||
        (asset.mainCategory && asset.mainCategory.toLowerCase().includes(q)) ||
        (asset.room && asset.room.toLowerCase().includes(q)) ||
        (asset.building && asset.building.toLowerCase().includes(q)) ||
        (asset.department && asset.department.toLowerCase().includes(q)) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(q)) ||
        (asset.assignedRole && asset.assignedRole.toLowerCase().includes(q)) ||
        (asset.assignedEmail && asset.assignedEmail.toLowerCase().includes(q));

      const matchesMainCat =
        selectedMainCat === 'All' ||
        asset.mainCategory === selectedMainCat ||
        (!asset.mainCategory && selectedMainCat === 'Furniture');

      const matchesSubCat =
        selectedSubCat === 'All' || asset.category === selectedSubCat;

      const matchesItemType =
        selectedItemType === 'All' || asset.itemType === selectedItemType;

      const matchesRoom =
        selectedRoom === 'All' || asset.room === selectedRoom;

      const matchesPerson =
        selectedPerson === 'All' || asset.assignedTo === selectedPerson;

      const matchesCondition =
        selectedCondition === 'All' || asset.condition === selectedCondition;

      const matchesStatus =
        selectedStatus === 'All' || asset.status === selectedStatus;

      return (
        matchesSearch &&
        matchesMainCat &&
        matchesSubCat &&
        matchesItemType &&
        matchesRoom &&
        matchesPerson &&
        matchesCondition &&
        matchesStatus
      );
    });
  }, [
    sourceAssets,
    searchQuery,
    selectedMainCat,
    selectedSubCat,
    selectedItemType,
    selectedRoom,
    selectedPerson,
    selectedCondition,
    selectedStatus
  ]);

  // Subcategories list based on selected Main Category
  const availableSubCategories = useMemo(() => {
    if (selectedMainCat === 'All') {
      const list = [];
      Object.entries(ASSET_CATEGORIES).forEach(([mainKey, main]) => {
        Object.entries(main.subCategories).forEach(([subKey, sub]) => {
          list.push({ mainKey, subKey, ...sub });
        });
      });
      return list;
    }
    const main = ASSET_CATEGORIES[selectedMainCat];
    if (!main) return [];
    return Object.entries(main.subCategories).map(([subKey, sub]) => ({
      mainKey: selectedMainCat,
      subKey,
      ...sub,
    }));
  }, [selectedMainCat]);

  // Available specific items for the selected subcategory
  const availableSpecificItems = useMemo(() => {
    if (selectedSubCat === 'All') return [];
    for (const main of Object.values(ASSET_CATEGORIES)) {
      if (main.subCategories[selectedSubCat]) {
        return main.subCategories[selectedSubCat].items;
      }
    }
    return [];
  }, [selectedSubCat]);

  // Aggregated Custodians List
  const custodiansDirectory = useMemo(() => {
    const map = {};

    usersList.forEach((user) => {
      map[user.name] = {
        name: user.name,
        role: user.role || 'Faculty / Staff',
        department: user.department || 'General',
        email: user.email || '',
        phone: user.phone || '',
        office: user.office || '',
        assets: [],
        totalUnits: 0,
        rooms: new Set(),
      };
    });

    sourceAssets.forEach((asset) => {
      const custodianName = asset.assignedTo || 'Unassigned';
      if (!map[custodianName]) {
        map[custodianName] = {
          name: custodianName,
          role: asset.assignedRole || 'Custodian In-Charge',
          department: asset.department || 'General',
          email: asset.assignedEmail || '',
          phone: '',
          office: asset.room || '',
          assets: [],
          totalUnits: 0,
          rooms: new Set(),
        };
      }
      map[custodianName].assets.push(asset);
      map[custodianName].totalUnits += asset.quantity || 1;
      if (asset.room) map[custodianName].rooms.add(asset.room);
    });

    return Object.values(map);
  }, [usersList, sourceAssets]);

  // Location Grouping
  const locationDirectory = useMemo(() => {
    const roomMap = {};
    sourceAssets.forEach((asset) => {
      const r = asset.room || 'Unassigned';
      if (!roomMap[r]) {
        roomMap[r] = {
          room: r,
          building: asset.building || 'Main Block',
          department: asset.department || 'General',
          assets: [],
          totalUnits: 0,
          custodians: new Set(),
        };
      }
      roomMap[r].assets.push(asset);
      roomMap[r].totalUnits += asset.quantity || 1;
      if (asset.assignedTo) roomMap[r].custodians.add(asset.assignedTo);
    });
    return Object.values(roomMap);
  }, [sourceAssets]);

  // Action handlers
  const handleOpenEdit = (asset) => {
    setEditingAsset(asset);
    setEditRoom(asset.room || 'CS-101');
    setEditBuilding(asset.building || 'Engineering Block');
    setEditPerson(asset.assignedTo || '');
    setEditRole(asset.assignedRole || 'Faculty In-Charge');
    setEditEmail(asset.assignedEmail || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingAsset) return;

    dispatch(
      updateFurnitureLocation({
        id: editingAsset.id,
        room: editRoom,
        building: editBuilding,
      })
    );

    dispatch(
      updateFurnitureCustodian({
        id: editingAsset.id,
        assignedTo: editPerson,
        assignedRole: editRole,
        assignedEmail: editEmail,
      })
    );

    dispatch(
      addNotification({
        title: 'Custodian Assigned',
        message: `${editingAsset.name} in Room ${editRoom} assigned to ${editPerson || 'Unassigned'}.`,
        type: 'transfer',
        link: `/assets/${editingAsset.id}`,
        department: editingAsset.department,
      })
    );

    setSuccessToast(`Assigned ${editPerson || 'Unassigned'} to ${editingAsset.name} (Room ${editRoom})`);
    setTimeout(() => setSuccessToast(''), 3500);
    setEditingAsset(null);
  };

  const handleOpenBulkAssign = () => {
    if (selectedAssetIds.length === 0) return;
    setBulkCustodianName('');
    setBulkCustodianRole('Faculty In-Charge');
    setBulkCustodianEmail('');
    setShowBulkModal(true);
  };

  const handleSaveBulkAssign = (e) => {
    e.preventDefault();
    if (!bulkCustodianName.trim() || selectedAssetIds.length === 0) return;

    dispatch(
      bulkAssignCustodians({
        assetIds: selectedAssetIds,
        assignedTo: bulkCustodianName,
        assignedRole: bulkCustodianRole,
        assignedEmail: bulkCustodianEmail,
      })
    );

    dispatch(
      addNotification({
        title: 'Bulk Custodian Assignment',
        message: `${selectedAssetIds.length} assets assigned to ${bulkCustodianName}.`,
        type: 'transfer',
        link: '/category',
      })
    );

    setSuccessToast(`Assigned ${bulkCustodianName} to ${selectedAssetIds.length} assets successfully.`);
    setTimeout(() => setSuccessToast(''), 3500);
    setSelectedAssetIds([]);
    setShowBulkModal(false);
  };

  const handleSelectAllFiltered = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map((a) => a.id));
    }
  };

  const toggleSelectAsset = (id) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectRegisteredUser = (userName, isBulk = false) => {
    const foundUser = usersList.find((u) => u.name === userName);
    if (isBulk) {
      setBulkCustodianName(userName);
      if (foundUser) {
        setBulkCustodianRole(foundUser.role || 'Faculty In-Charge');
        setBulkCustodianEmail(foundUser.email || '');
      }
    } else {
      setEditPerson(userName);
      if (foundUser) {
        setEditRole(foundUser.role || 'Staff In-Charge');
        setEditEmail(foundUser.email || '');
        if (foundUser.office) setEditRoom(foundUser.office);
      }
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset all categories, assets, and custodian assignments to the standard institutional catalog?')) {
      dispatch(resetToDefaultCatalog());
      setSuccessToast('Standard catalog and custodians restored.');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const clearAllFilters = () => {
    setSelectedMainCat('All');
    setSelectedSubCat('All');
    setSelectedItemType('All');
    setSelectedRoom('All');
    setSelectedPerson('All');
    setSelectedCondition('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setSelectedAssetIds([]);
  };

  const hasActiveFilters = 
    selectedMainCat !== 'All' ||
    selectedSubCat !== 'All' ||
    selectedItemType !== 'All' ||
    selectedRoom !== 'All' ||
    selectedPerson !== 'All' ||
    selectedCondition !== 'All' ||
    selectedStatus !== 'All' ||
    searchQuery !== '';

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">
            Category & Custodian Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Browse 3-tier taxonomy, locate assets across campus, and assign responsible custodians
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetCatalog}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
            title="Reset to default institutional catalog"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Catalog</span>
          </button>

          <Btn onClick={() => navigate('/assets/new')}>
            <Icon.Plus /> New Asset
          </Btn>
        </div>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm rounded-2xl p-3.5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Organized KPI Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
            📦
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Quantity</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono leading-tight">
              {sourceAssets.reduce((s, a) => s + (a.quantity || 1), 0)} Units
            </h3>
            <span className="text-[11px] text-slate-500">{sourceAssets.length} unique asset types</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
            👥
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custodians</p>
            <h3 className="text-xl font-black text-violet-600 dark:text-violet-400 font-mono leading-tight">
              {Array.from(new Set(sourceAssets.map(a => a.assignedTo).filter(Boolean))).length} Assigned
            </h3>
            <span className="text-[11px] text-slate-500">Responsible personnel</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
            📍
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Locations</p>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-tight">
              {Array.from(new Set(sourceAssets.map(a => a.room).filter(Boolean))).length} Rooms
            </h3>
            <span className="text-[11px] text-slate-500">Across campus blocks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
            🗂️
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxonomy</p>
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono leading-tight">
              3 Categories
            </h3>
            <span className="text-[11px] text-slate-500">11 Subcategories · 36 Types</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Mode Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl max-w-xl">
        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'taxonomy'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Category & Asset Finder</span>
        </button>

        <button
          onClick={() => setActiveTab('custodians')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'custodians'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Custodians Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'locations'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Room Allocation</span>
        </button>
      </div>

      {/* 4. MAIN TAB: CATEGORY & ASSET LOCATOR */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-5">
          {/* Level 1: Main Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* All Categories Card */}
            <div
              onClick={() => {
                setSelectedMainCat('All');
                setSelectedSubCat('All');
                setSelectedItemType('All');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group min-h-[110px] ${
                selectedMainCat === 'All'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border-indigo-600 ring-2 ring-indigo-600/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🏛️</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  selectedMainCat === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {sourceAssets.reduce((s, a) => s + (a.quantity || 1), 0)} Units
                </span>
              </div>
              <div>
                <h3 className={`font-bold text-sm font-display ${selectedMainCat === 'All' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  All Categories
                </h3>
                <p className={`text-[11px] mt-0.5 ${selectedMainCat === 'All' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  Entire campus inventory
                </p>
              </div>
            </div>

            {/* Main Category Cards */}
            {MAIN_CATEGORIES.map((mainKey) => {
              const info = ASSET_CATEGORIES[mainKey];
              const isSelected = selectedMainCat === mainKey;
              const mainAssets = sourceAssets.filter(
                (a) => a.mainCategory === mainKey || (!a.mainCategory && mainKey === 'Furniture')
              );
              const totalUnits = mainAssets.reduce((s, a) => s + (a.quantity || 1), 0);
              const subCount = Object.keys(info.subCategories).length;

              return (
                <div
                  key={mainKey}
                  onClick={() => {
                    setSelectedMainCat(mainKey);
                    setSelectedSubCat('All');
                    setSelectedItemType('All');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group min-h-[110px] ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border-indigo-600 ring-2 ring-indigo-600/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{info.icon}</span>
                      <h3 className={`font-bold text-sm font-display ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {mainKey}
                      </h3>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {totalUnits}
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-1 font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {subCount} Subcategories: {Object.keys(info.subCategories).join(', ')}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Level 2 & 3: Hierarchical Subcategory & Item Filter Shelf */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3.5">
            {/* Subcategory selection pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  Subcategory Tier
                </span>
                {selectedSubCat !== 'All' && (
                  <button
                    onClick={() => {
                      setSelectedSubCat('All');
                      setSelectedItemType('All');
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    View All Subcategories
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedSubCat('All');
                    setSelectedItemType('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedSubCat === 'All'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Subcategories
                </button>

                {availableSubCategories.map((sub) => {
                  const isSelected = selectedSubCat === sub.subKey;
                  const count = sourceAssets.filter((a) => a.category === sub.subKey).reduce((s, a) => s + (a.quantity || 1), 0);
                  return (
                    <button
                      key={sub.subKey}
                      onClick={() => {
                        setSelectedSubCat(sub.subKey);
                        setSelectedItemType('All');
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.name}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Item Types Pills (Level 3) */}
            {availableSpecificItems.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
                  Specific Fixture / Equipment Type:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setSelectedItemType('All')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedItemType === 'All'
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    All Types
                  </button>
                  {availableSpecificItems.map((item) => {
                    const isSelected = selectedItemType === item;
                    return (
                      <button
                        key={item}
                        onClick={() => setSelectedItemType(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Organized Filter Toolbar */}
          <Card className="p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Asset Name, ID (e.g. AST-002), Room (e.g. CS-101), or Custodian Person..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-2 self-end lg:self-auto">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Filter by Location
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {uniqueRooms.map((r) => (
                    <option key={r} value={r}>{r === 'All' ? '📍 All Rooms' : `📍 Room ${r}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Filter by Custodian
                </label>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {uniquePeople.map((p) => (
                    <option key={p} value={p}>{p === 'All' ? '👤 All Custodians' : `👤 ${p}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Condition
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {['All', 'Good', 'Fair', 'Poor', 'Damaged'].map((c) => (
                    <option key={c} value={c}>{c === 'All' ? 'All Conditions' : c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {['All', 'In Use', 'Available', 'Needs Inspection', 'Retired'].map((s) => (
                    <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action & Active Filters bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllFiltered}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                >
                  {selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Select All ({filteredAssets.length})</span>
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-1"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Showing {filteredAssets.length} of {sourceAssets.length} assets ({filteredAssets.reduce((s, a) => s + (a.quantity || 1), 0)} units)
              </span>
            </div>
          </Card>

          {/* Floating Bulk Custodian Action Bar */}
          {selectedAssetIds.length > 0 && (
            <div className="sticky top-4 z-30 bg-slate-900 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border border-slate-800">
              <div className="flex items-center gap-2.5 pl-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span className="text-xs sm:text-sm font-bold">
                  {selectedAssetIds.length} assets selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAssetIds([])}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenBulkAssign}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Custodian</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. Assets Result View: Cards / Table */}
          {filteredAssets.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                🔍
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">No Assets Match Filters</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Try resetting category, room, or search keyword filters.
              </p>
              <Btn variant="secondary" onClick={clearAllFilters}>
                Reset All Filters
              </Btn>
            </Card>
          ) : viewMode === 'grid' ? (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);

                return (
                  <Card
                    key={asset.id}
                    className={`p-4 border-2 transition-all duration-200 flex flex-col justify-between group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Header with ID, condition, and select */}
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectAsset(asset.id);
                            }}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                            {asset.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {asset.quantity || 1} units
                          </span>
                          <Badge label={asset.condition} type="condition" />
                        </div>
                      </div>

                      {/* Title & Hierarchy Breadcrumb */}
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display leading-snug mb-1" title={asset.name}>
                        {asset.name}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 mb-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {asset.mainCategory || 'Furniture'}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium">
                          {asset.category}
                        </span>
                        {asset.itemType && (
                          <>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            <span className="px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium">
                              {asset.itemType}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Location & Custodian Boxed Cards */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        {/* Location Box */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                            <MapPin className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                            <span className="truncate">Where? (Room)</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                              Room {asset.room || 'Unassigned'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {asset.building || 'Main Block'}
                            </p>
                          </div>
                        </div>

                        {/* Custodian Box */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                            <User className="w-3 h-3 text-violet-600 flex-shrink-0" />
                            <span className="truncate">Whom? (User)</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 truncate" title={asset.assignedTo}>
                              {asset.assignedTo || 'Unassigned'}
                            </p>
                            <p className="text-[10px] text-violet-600 dark:text-violet-400 truncate">
                              {asset.assignedRole || 'Faculty / Staff'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        ₹{(asset.cost || 0).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-200 transition cursor-pointer"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          title="View Full Profile"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                      <th className="px-4 py-3 w-8">
                        <button onClick={handleSelectAllFiltered} className="cursor-pointer">
                          {selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3">Asset Code & Item</th>
                      <th className="px-4 py-3">Category Taxonomy</th>
                      <th className="px-4 py-3">Location (Where?)</th>
                      <th className="px-4 py-3">Custodian (Whom?)</th>
                      <th className="px-4 py-3 text-center">Units</th>
                      <th className="px-4 py-3">Condition</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAssetIds.includes(asset.id);

                      return (
                        <tr
                          key={asset.id}
                          className={`transition ${
                            isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <button onClick={() => toggleSelectAsset(asset.id)} className="cursor-pointer text-slate-400">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{asset.name}</span>
                              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{asset.id}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">{asset.category}</span>
                            {asset.itemType && (
                              <span className="text-slate-400 text-[11px] block">{asset.itemType}</span>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200">Room {asset.room}</p>
                                <p className="text-[10px] text-slate-400">{asset.building}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{asset.assignedTo || 'Unassigned'}</p>
                                <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">{asset.assignedRole || 'Custodian'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {asset.quantity || 1}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge label={asset.condition} type="condition" />
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(asset)}
                                className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition cursor-pointer"
                              >
                                Reassign
                              </button>
                              <button
                                onClick={() => navigate(`/assets/${asset.id}`)}
                                className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                                title="View Details"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 5. CUSTODIANS DIRECTORY TAB */}
      {activeTab === 'custodians' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {custodiansDirectory.map((c) => (
              <Card key={c.name} className="p-5 border-2 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold text-sm flex items-center justify-center">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display leading-tight">{c.name}</h4>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{c.role}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                      {c.totalUnits} Units
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold">{c.department}</span>
                    </div>
                    {c.email && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{c.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rooms Covered:</span>
                      <span className="font-semibold">{c.rooms.size > 0 ? Array.from(c.rooms).join(', ') : 'None'}</span>
                    </div>
                  </div>

                  {c.assets.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assigned Equipment ({c.assets.length})
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-[72px] overflow-y-auto">
                        {c.assets.map(a => (
                          <span key={a.id} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-medium">
                            {a.name} ({a.quantity || 1})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedPerson(c.name);
                      setActiveTab('taxonomy');
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All Allocated Assets <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 6. ROOM ALLOCATION TAB */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationDirectory.map((loc) => (
            <Card key={loc.room} className="p-5 border-2 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Room {loc.room}</h4>
                      <p className="text-xs text-slate-400">{loc.building} · {loc.department}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                    {loc.totalUnits} Units
                  </span>
                </div>

                {loc.custodians.size > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs mb-3">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block mb-0.5">Custodians in this Room:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{Array.from(loc.custodians).join(', ')}</span>
                  </div>
                )}

                <div className="space-y-1 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assets in Room ({loc.assets.length})
                  </span>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto">
                    {loc.assets.map(a => (
                      <div key={a.id} className="flex justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{a.name}</span>
                        <span className="font-mono text-slate-400">{a.quantity || 1} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedRoom(loc.room);
                    setActiveTab('taxonomy');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Locate all items in Room {loc.room} →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL: Single Asset Custodian & Room Assignment */}
      {editingAsset && (
        <Modal
          title={`Assign Custodian & Location — ${editingAsset.name}`}
          onClose={() => setEditingAsset(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-500">Asset: </span>
                <span className="font-bold text-slate-800 dark:text-white">{editingAsset.name}</span>
                <span className="text-slate-400 font-mono ml-2">({editingAsset.id})</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-[11px] font-bold">
                {editingAsset.category}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1. Select Institutional Custodian
              </label>

              <div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Choose from Faculty & Staff Directory (Auto-Fills):
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleSelectRegisteredUser(e.target.value, false);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                >
                  <option value="">-- Select responsible custodian --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.name}>
                      👤 {u.name} ({u.role} - {u.department})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Custodian Name"
                value={editPerson}
                onChange={(e) => setEditPerson(e.target.value)}
                placeholder="e.g. Prof. Anitha Sharma"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Role / Designation"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="e.g. Lab In-Charge & Faculty"
                />

                <Input
                  label="Contact Email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. anitha.sharma@nec.edu.in"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                2. Physical Placement Location
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Campus Building"
                  value={editBuilding}
                  onChange={(e) => setEditBuilding(e.target.value)}
                  placeholder="e.g. Engineering Block"
                  required
                />

                <Input
                  label="Room / Lab Number"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  placeholder="e.g. CS-101, ECE-Lab2"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" onClick={() => setEditingAsset(null)}>
                Cancel
              </Btn>
              <Btn type="submit">
                Save & Assign Custodian
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Bulk Custodian Assignment */}
      {showBulkModal && (
        <Modal
          title={`Bulk Assign Custodian to ${selectedAssetIds.length} Assets`}
          onClose={() => setShowBulkModal(false)}
        >
          <form onSubmit={handleSaveBulkAssign} className="space-y-4">
            <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
              <p className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                Assigning Custodian to {selectedAssetIds.length} Selected Assets:
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {selectedAssetIds.slice(0, 6).join(', ')}
                {selectedAssetIds.length > 6 ? ` +${selectedAssetIds.length - 6} more` : ''}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Choose from Institutional Staff (Auto-Fill)
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleSelectRegisteredUser(e.target.value, true);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                >
                  <option value="">-- Choose faculty/staff member --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.name}>
                      👤 {u.name} ({u.role} - {u.department})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Custodian Name"
                value={bulkCustodianName}
                onChange={(e) => setBulkCustodianName(e.target.value)}
                placeholder="e.g. Prof. Suresh Babu"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Role / Designation"
                  value={bulkCustodianRole}
                  onChange={(e) => setBulkCustodianRole(e.target.value)}
                  placeholder="e.g. Lab In-Charge"
                />

                <Input
                  label="Contact Email"
                  type="email"
                  value={bulkCustodianEmail}
                  onChange={(e) => setBulkCustodianEmail(e.target.value)}
                  placeholder="e.g. suresh.babu@nec.edu.in"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" onClick={() => setShowBulkModal(false)}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={!bulkCustodianName.trim()}>
                Assign Custodian to All Selected
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
