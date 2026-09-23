import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Btn, Badge, Modal, Input } from '../components/UIComponents';
import { 
  ASSET_CATEGORIES, 
  MAIN_CATEGORIES
} from '../constants/assetCategories';
import { 
  updateFurnitureCustodian, 
  updateFurnitureLocation,
  bulkAssignCustodians
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
  Filter, 
  X, 
  ChevronRight, 
  DoorOpen,
  ArrowRight,
  Package,
  FolderTree,
  Armchair,
  GraduationCap,
  Zap,
  Plus,
  SlidersHorizontal
} from 'lucide-react';

const getCategoryIcon = (categoryName, isSelected = false) => {
  const cls = `w-5 h-5 ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`;
  switch (categoryName) {
    case 'Furniture':
      return <Armchair className={cls} />;
    case 'Teaching Equipment':
      return <GraduationCap className={cls} />;
    case 'Electricals':
      return <Zap className={cls} />;
    default:
      return <Package className={cls} />;
  }
};

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
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

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

  const activeFiltersCount = [
    selectedMainCat !== 'All',
    selectedSubCat !== 'All',
    selectedItemType !== 'All',
    selectedRoom !== 'All',
    selectedPerson !== 'All',
    selectedCondition !== 'All',
    selectedStatus !== 'All',
    Boolean(searchQuery)
  ].filter(Boolean).length;

  const totalQuantityUnits = sourceAssets.reduce((s, a) => s + (a.quantity || 1), 0);
  const totalCustodiansCount = Array.from(new Set(sourceAssets.map(a => a.assignedTo).filter(Boolean))).length;
  const totalRoomsCount = Array.from(new Set(sourceAssets.map(a => a.room).filter(Boolean))).length;

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* 1. Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Category & Custodian Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse campus taxonomy, locate fixtures across blocks, and assign responsible faculty custodians
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-shrink-0">
          <Btn onClick={() => navigate('/assets/new')} className="!py-2.5 !px-4 text-sm font-bold">
            <Plus className="w-4 h-4 mr-1" /> New Asset
          </Btn>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-sm rounded-2xl px-4 py-3.5 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Prominent KPI Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quantity</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono leading-tight mt-0.5">
              {totalQuantityUnits} Units
            </h3>
            <span className="text-xs text-slate-500">{sourceAssets.length} unique assets</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custodians</p>
            <h3 className="text-xl sm:text-2xl font-black text-violet-600 dark:text-violet-400 font-mono leading-tight mt-0.5">
              {totalCustodiansCount} Assigned
            </h3>
            <span className="text-xs text-slate-500">Responsible faculty</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locations</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-tight mt-0.5">
              {totalRoomsCount} Rooms
            </h3>
            <span className="text-xs text-slate-500">Across campus blocks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxonomy</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono leading-tight mt-0.5">
              3 Categories
            </h3>
            <span className="text-xs text-slate-500">11 Subcategories</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Segmented Mode Switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Room Allocation</span>
          </button>
        </div>

        {activeTab === 'taxonomy' && (
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Showing {filteredAssets.length} of {sourceAssets.length} assets ({filteredAssets.reduce((s, a) => s + (a.quantity || 1), 0)} units)
            </span>
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200/60 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Cards"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden md:inline font-bold">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Data Table"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline font-bold">Table</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. TAXONOMY & ASSET FINDER VIEW */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-4">
          {/* Unified Category & Subcategory Navigation Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            {/* Tier 1: Main Category Tabs */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedMainCat('All');
                    setSelectedSubCat('All');
                    setSelectedItemType('All');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    selectedMainCat === 'All'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>All Categories</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${selectedMainCat === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {sourceAssets.reduce((s, a) => s + (a.quantity || 1), 0)}
                  </span>
                </button>

                {MAIN_CATEGORIES.map((mainKey) => {
                  const isSelected = selectedMainCat === mainKey;
                  const mainAssets = sourceAssets.filter(
                    (a) => a.mainCategory === mainKey || (!a.mainCategory && mainKey === 'Furniture')
                  );
                  const totalUnits = mainAssets.reduce((s, a) => s + (a.quantity || 1), 0);

                  return (
                    <button
                      key={mainKey}
                      onClick={() => {
                        setSelectedMainCat(mainKey);
                        setSelectedSubCat('All');
                        setSelectedItemType('All');
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {getCategoryIcon(mainKey, isSelected)}
                      <span>{mainKey}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {totalUnits}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Tier 2: Subcategory Pills Ribbon */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
                  Subcategories:
                </span>

                <button
                  onClick={() => {
                    setSelectedSubCat('All');
                    setSelectedItemType('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                    selectedSubCat === 'All'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span className={`text-[11px] font-mono px-1 rounded ${isSelected ? 'opacity-90' : 'text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tier 3: Specific Fixture Types */}
            {availableSpecificItems.length > 0 && (
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
                  Specific Type:
                </span>
                <button
                  onClick={() => setSelectedItemType('All')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedItemType === 'All'
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Unified Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Asset Name, ID (e.g. AST-002), Room (e.g. CS-101), or Custodian..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters Toggle Button */}
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                  showFiltersPanel || (selectedRoom !== 'All' || selectedPerson !== 'All' || selectedCondition !== 'All' || selectedStatus !== 'All')
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {(selectedRoom !== 'All' || selectedPerson !== 'All' || selectedCondition !== 'All' || selectedStatus !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                )}
              </button>

              {/* Select All Checkbox */}
              <button
                onClick={handleSelectAllFiltered}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
              >
                {selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All ({filteredAssets.length})</span>
              </button>
            </div>

            {/* Collapsible Filter Dropdowns */}
            {showFiltersPanel && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm animate-in fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Location
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {uniqueRooms.map((r) => (
                      <option key={r} value={r}>{r === 'All' ? 'All Rooms' : `Room ${r}`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Custodian
                  </label>
                  <select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {uniquePeople.map((p) => (
                      <option key={p} value={p}>{p === 'All' ? 'All Custodians' : p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Condition
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {['All', 'Good', 'Fair', 'Poor', 'Damaged'].map((c) => (
                      <option key={c} value={c}>{c === 'All' ? 'All Conditions' : c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {['All', 'In Use', 'Available', 'Needs Inspection', 'Retired'].map((s) => (
                      <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Floating Bulk Custodian Action Bar */}
          {selectedAssetIds.length > 0 && (
            <div className="sticky top-4 z-30 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border border-slate-800">
              <div className="flex items-center gap-3 pl-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold">
                  {selectedAssetIds.length} assets selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAssetIds([])}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenBulkAssign}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Custodian</span>
                </button>
              </div>
            </div>
          )}

          {/* Asset Records (Cards View vs. Table View) */}
          {filteredAssets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-14 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">No Assets Match Filters</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Try resetting category, room, or search keyword filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Generously Spaced, Readable Grid Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);

                return (
                  <div
                    key={asset.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between group ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Card Header: ID, Checkbox & Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSelectAsset(asset.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4.5 h-4.5 text-indigo-600" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {asset.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {asset.quantity || 1} units
                          </span>
                          <Badge label={asset.condition} type="condition" />
                        </div>
                      </div>

                      {/* Asset Title */}
                      <h4 className="font-bold text-slate-900 dark:text-white text-base font-display leading-snug line-clamp-1 mb-1" title={asset.name}>
                        {asset.name}
                      </h4>

                      {/* Breadcrumb path */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5 flex items-center gap-1.5 truncate">
                        <span>{asset.mainCategory || 'Furniture'}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{asset.category}</span>
                        {asset.itemType && (
                          <>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            <span className="text-slate-500">{asset.itemType}</span>
                          </>
                        )}
                      </p>

                      {/* Location & Custodian Metadata Box */}
                      <div className="space-y-2 py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs sm:text-sm mb-3.5 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 min-w-0">
                            <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              Room {asset.room || 'Unassigned'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 truncate flex-shrink-0">
                            {asset.building || 'Main Block'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 min-w-0">
                            <User className="w-4 h-4 text-violet-600 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={asset.assignedTo}>
                              {asset.assignedTo || 'Unassigned'}
                            </span>
                          </div>
                          <span className="text-xs text-violet-600 dark:text-violet-400 truncate flex-shrink-0 font-medium">
                            {asset.assignedRole || 'Custodian'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                      <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                        ₹{(asset.cost || 0).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          title="View Asset Profile"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Crisp Table View */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-4 py-3.5 w-8">
                        <button onClick={handleSelectAllFiltered} className="cursor-pointer">
                          {selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3.5">Asset Code & Item</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Location</th>
                      <th className="px-4 py-3.5">Custodian</th>
                      <th className="px-4 py-3.5 text-center">Units</th>
                      <th className="px-4 py-3.5">Condition</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAssetIds.includes(asset.id);

                      return (
                        <tr
                          key={asset.id}
                          className={`transition ${
                            isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
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
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{asset.name}</span>
                              <span className="font-mono text-xs text-slate-400">{asset.id}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">{asset.category}</span>
                            {asset.itemType && (
                              <span className="text-slate-400 text-xs block">{asset.itemType}</span>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">Room {asset.room}</p>
                                <p className="text-xs text-slate-400">{asset.building}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-violet-600 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{asset.assignedTo || 'Unassigned'}</p>
                                <p className="text-xs text-slate-400">{asset.assignedRole || 'Custodian'}</p>
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
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition cursor-pointer"
                              >
                                Reassign
                              </button>
                              <button
                                onClick={() => navigate(`/assets/${asset.id}`)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
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
            </div>
          )}
        </div>
      )}

      {/* 5. CUSTODIANS DIRECTORY VIEW */}
      {activeTab === 'custodians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {custodiansDirectory.map((c) => (
            <div
              key={c.name}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center">
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base font-display leading-tight">{c.name}</h4>
                      <p className="text-xs text-slate-400">{c.role}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
                    {c.totalUnits} Units
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs sm:text-sm space-y-1.5 text-slate-600 dark:text-slate-300 mb-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">Department:</span>
                    <span className="font-medium">{c.department}</span>
                  </div>
                  {c.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-xs">Email:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{c.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">Rooms:</span>
                    <span className="font-medium">{c.rooms.size > 0 ? Array.from(c.rooms).join(', ') : 'None'}</span>
                  </div>
                </div>

                {c.assets.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Assets ({c.assets.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto">
                      {c.assets.map(a => (
                        <span key={a.id} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
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
                  className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  Filter Assets by {c.name.split(' ')[0]} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. ROOM ALLOCATION VIEW */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationDirectory.map((loc) => (
            <div
              key={loc.room}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <DoorOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base font-display">Room {loc.room}</h4>
                      <p className="text-xs text-slate-400">{loc.building} · {loc.department}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
                    {loc.totalUnits} Units
                  </span>
                </div>

                {loc.custodians.size > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-xs sm:text-sm mb-4 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Custodians:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{Array.from(loc.custodians).join(', ')}</span>
                  </div>
                )}

                <div className="space-y-1.5 mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Assets in Room ({loc.assets.length})
                  </span>
                  <div className="space-y-1.5 max-h-[96px] overflow-y-auto">
                    {loc.assets.map(a => (
                      <div key={a.id} className="flex justify-between text-xs sm:text-sm py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[220px]">{a.name}</span>
                        <span className="font-mono text-slate-400 flex-shrink-0">{a.quantity || 1} units</span>
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
                  className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  Locate all items in Room {loc.room} →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Single Asset Custodian & Room Assignment */}
      {editingAsset && (
        <Modal
          title={`Assign Custodian — ${editingAsset.name}`}
          onClose={() => setEditingAsset(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs sm:text-sm flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-500">Asset: </span>
                <span className="font-bold text-slate-800 dark:text-white">{editingAsset.name}</span>
                <span className="text-slate-400 font-mono ml-2">({editingAsset.id})</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-xs font-bold">
                {editingAsset.category}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1. Select Institutional Custodian
              </label>

              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Choose from Faculty & Staff Directory (Auto-Fills):
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleSelectRegisteredUser(e.target.value, false);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Select responsible custodian --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role} - {u.department})
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
                  placeholder="e.g. Lab In-Charge"
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
                Save Custodian
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
            <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm">
              <p className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                Assigning Custodian to {selectedAssetIds.length} Selected Assets:
              </p>
              <p className="text-xs text-slate-500 font-mono">
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
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose faculty/staff member --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role} - {u.department})
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
                Assign Custodian
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
