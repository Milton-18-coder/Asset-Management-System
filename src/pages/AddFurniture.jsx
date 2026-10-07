import React, { useReducer, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { addFurniture, editFurniture } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { 
  addPrimaryCategory, 
  addSubCategory, 
  addItemType 
} from '../store/categoriesSlice';
import { addPurchaseHistoryRecord } from '../store/purchaseHistorySlice';
import { api } from '../api';
import { Card, Btn, Input, Select, Badge, Icon, Modal } from '../components/UIComponents';
import { 
  ASSET_CATEGORIES, 
  getMainCategories,
  getSubCategories,
  getItemTypes
} from '../constants/assetCategories';
import { ALLOWED_DEPARTMENTS, isValidDepartment, mapLegacyDepartment } from '../constants/departments';
import { User, MapPin, FolderTree, Plus, Sparkles, FolderPlus, Layers, Tag, ShieldCheck, Store, ShoppingBag } from 'lucide-react';

const createInitialState = (editAsset, userDept) => {
  const safeDept = mapLegacyDepartment(editAsset?.department || userDept);
  if (editAsset) {
    return {
      id: editAsset.id,
      name: editAsset.name || '',
      mainCategory: editAsset.mainCategory || 'Furniture',
      category: editAsset.category || 'Chair',
      itemType: editAsset.itemType || 'Student Chair',
      description: editAsset.description || 'No description provided',
      building: editAsset.building || 'Engineering Block',
      department: safeDept,
      room: editAsset.room || 'CS-101',
      assignedTo: editAsset.assignedTo || 'Unassigned',
      assignedRole: editAsset.assignedRole || 'Faculty In-Charge',
      assignedEmail: editAsset.assignedEmail || 'admin@nec.edu.in',
      quantity: editAsset.quantity || 1,
      purchaseDate: editAsset.purchaseDate || new Date().toISOString().split('T')[0],
      cost: editAsset.cost || 0,
      supplier: editAsset.supplier || 'Campus Procurement',
      warranty: editAsset.warranty || 'Standard Warranty',
      invoiceNumber: editAsset.invoiceNumber || '',
      invoiceDate: editAsset.invoiceDate || (editAsset.purchaseDate || new Date().toISOString().split('T')[0]),
      notes: editAsset.notes || '',
      condition: editAsset.condition || 'Good',
      status: editAsset.status || 'In Use',
    };
  }

  return {
    id: 'AST-' + Math.floor(100 + Math.random() * 900),
    name: '',
    mainCategory: 'Furniture',
    category: 'Chair',
    itemType: 'Student Chair',
    description: '',
    building: 'Engineering Block',
    department: safeDept,
    room: 'CS-101',
    assignedTo: '',
    assignedRole: 'Faculty In-Charge',
    assignedEmail: '',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    cost: 0,
    supplier: '',
    warranty: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    notes: '',
    condition: 'Good',
    status: 'In Use',
  };
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'LOAD_EDIT':
      return action.payload;
    case 'RESET_FORM':
      return action.payload;
    default:
      return state;
  }
}

export const AddFurniture = ({ selectedFurniture: propSelected, clearSelectedFurniture }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);
  const usersList = useSelector((state) => state.users.list);
  const taxonomy = useSelector((state) => state.categories?.taxonomy || ASSET_CATEGORIES);

  const selectedFurniture = propSelected || (id ? furnitureList.find((f) => f.id === id) : null);

  const [success, setSuccess] = useState(false);
  const userDept = currentUser?.department || 'Computer Science';
  const vendorsList = useSelector((state) => state.furniture?.vendors || []);

  // Role permissions check: Super Admin and Dept Admin can add categories
  const userRole = (currentUser?.role || '').toLowerCase();
  const canManageCategories = 
    userRole === 'superadmin' || 
    userRole === 'deptadmin' || 
    userRole === 'super admin' || 
    userRole === 'dept admin';

  // Modal States for Quick-Adding Categories
  const [isAddPrimaryModalOpen, setIsAddPrimaryModalOpen] = useState(false);
  const [primaryFormData, setPrimaryFormData] = useState({
    name: '',
    description: '',
    initialSubCategory: '',
    initialItemType: '',
  });

  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [subFormData, setSubFormData] = useState({
    mainCategory: '',
    name: '',
    description: '',
    initialItemType: '',
  });

  const [isAddItemTypeModalOpen, setIsAddItemTypeModalOpen] = useState(false);
  const [itemTypeFormData, setItemTypeFormData] = useState({
    name: '',
  });

  const [formState, formDispatch] = useReducer(
    formReducer,
    selectedFurniture,
    (selected) => createInitialState(selected, userDept)
  );

  useEffect(() => {
    if (selectedFurniture) {
      formDispatch({ type: 'LOAD_EDIT', payload: createInitialState(selectedFurniture, userDept) });
    }
  }, [selectedFurniture, userDept]);

  const handleInputChange = (field, value) => {
    formDispatch({ type: 'SET_FIELD', field, value });
  };

  // Dynamic Primary Category options
  const mainCategoryOptions = useMemo(() => {
    return getMainCategories(taxonomy);
  }, [taxonomy]);

  // Subcategories based on chosen Main Category & dynamic taxonomy
  const subCategoryOptions = useMemo(() => {
    const subs = getSubCategories(formState.mainCategory, taxonomy);
    if (subs.length > 0) return subs;
    return ['General'];
  }, [taxonomy, formState.mainCategory]);

  // Item types based on Subcategory & dynamic taxonomy
  const itemTypeOptions = useMemo(() => {
    return getItemTypes(formState.mainCategory, formState.category, taxonomy);
  }, [taxonomy, formState.mainCategory, formState.category]);

  const handleMainCategoryChange = (mainCat) => {
    handleInputChange('mainCategory', mainCat);
    const subs = getSubCategories(mainCat, taxonomy);
    const firstSub = subs.length > 0 ? subs[0] : 'General';
    handleInputChange('category', firstSub);
    const firstItems = getItemTypes(mainCat, firstSub, taxonomy);
    handleInputChange('itemType', firstItems[0] || firstSub);
  };

  const handleSubCategoryChange = (subCat) => {
    handleInputChange('category', subCat);
    const items = getItemTypes(formState.mainCategory, subCat, taxonomy);
    handleInputChange('itemType', items[0] || subCat);
  };

  const handleUserSelectAutoFill = (userName) => {
    handleInputChange('assignedTo', userName);
    const foundUser = usersList.find((u) => u.name === userName);
    if (foundUser) {
      handleInputChange('assignedRole', foundUser.role || 'Faculty In-Charge');
      handleInputChange('assignedEmail', foundUser.email || '');
      if (foundUser.office) {
        handleInputChange('room', foundUser.office);
      }
    }
  };

  // Handler: Add New Primary Category
  const handleAddPrimaryCategorySubmit = async (e) => {
    e.preventDefault();
    if (!primaryFormData.name.trim()) return;

    const catName = primaryFormData.name.trim();
    const subCatName = primaryFormData.initialSubCategory.trim() || 'General';
    const itemTypeName = primaryFormData.initialItemType.trim() || subCatName;

    dispatch(addPrimaryCategory({
      name: catName,
      description: primaryFormData.description.trim(),
      color: primaryFormData.color,
      initialSubCategory: subCatName,
      initialItemType: itemTypeName,
    }));

    try {
      api.addCategory({
        name: subCatName,
        mainCategory: catName,
        description: primaryFormData.description.trim() || `${catName} asset category`,
      }).catch(() => {});
    } catch {
      // Backend optional
    }

    dispatch(
      addNotification({
        title: 'Primary Category Added',
        message: `Primary category "${catName}" with initial subcategory "${subCatName}" has been created.`,
        type: 'category',
        link: '/category',
        department: formState.department,
      })
    );

    // Immediately select the new primary category and subcategory
    handleInputChange('mainCategory', catName);
    handleInputChange('category', subCatName);
    handleInputChange('itemType', itemTypeName);

    setIsAddPrimaryModalOpen(false);
    setPrimaryFormData({
      name: '',
      description: '',
      initialSubCategory: '',
      initialItemType: '',
    });
  };

  // Handler: Add New Subcategory
  const handleAddSubCategorySubmit = async (e) => {
    e.preventDefault();
    if (!subFormData.name.trim()) return;

    const mainCat = subFormData.mainCategory || formState.mainCategory;
    const subCatName = subFormData.name.trim();
    const itemTypeName = subFormData.initialItemType.trim() || subCatName;

    dispatch(addSubCategory({
      mainCategory: mainCat,
      name: subCatName,
      description: subFormData.description.trim(),
      initialItemType: itemTypeName,
    }));

    try {
      api.addCategory({
        name: subCatName,
        mainCategory: mainCat,
        description: subFormData.description.trim() || `${subCatName} under ${mainCat}`,
      }).catch(() => {});
    } catch {
      // Backend optional
    }

    dispatch(
      addNotification({
        title: 'Subcategory Added',
        message: `Subcategory "${subCatName}" added under ${mainCat}.`,
        type: 'category',
        link: '/category',
        department: formState.department,
      })
    );

    // Switch form to select the subcategory immediately
    handleInputChange('mainCategory', mainCat);
    handleInputChange('category', subCatName);
    handleInputChange('itemType', itemTypeName);

    setIsAddSubModalOpen(false);
    setSubFormData({
      mainCategory: '',
      name: '',
      description: '',
      initialItemType: '',
    });
  };

  // Handler: Add Specific Item Type
  const handleAddItemTypeSubmit = (e) => {
    e.preventDefault();
    if (!itemTypeFormData.name.trim()) return;

    const itemName = itemTypeFormData.name.trim();
    dispatch(addItemType({
      mainCategory: formState.mainCategory,
      subCategory: formState.category,
      name: itemName,
    }));

    handleInputChange('itemType', itemName);
    setIsAddItemTypeModalOpen(false);
    setItemTypeFormData({ name: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    if (!isValidDepartment(formState.department)) {
      alert(`Invalid department "${formState.department}". Must be one of the 9 official departments/blocks.`);
      return;
    }

    if (selectedFurniture) {
      dispatch(editFurniture(formState));
      try {
        api.updateAsset(formState.id, formState, currentUser).catch(() => {});
      } catch {
        // Backend optional
      }
      dispatch(
        addNotification({
          title: 'Asset Updated',
          message: `${formState.name} (${formState.id}) modified in ${formState.department} (Room ${formState.room}).`,
          type: 'asset',
          link: `/assets/${formState.id}`,
          department: formState.department,
        })
      );
    } else {
      dispatch(addFurniture(formState));
      
      // Also record initial purchase transaction in purchase history
      const priceNum = parseFloat(formState.cost) || 0;
      const qtyNum = parseInt(formState.quantity, 10) || 1;
      const purchaseTransaction = {
        id: `PUR-${Date.now()}`,
        assetId: formState.id,
        assetName: formState.name.trim(),
        vendorId: null,
        vendorName: formState.supplier || 'Campus Procurement',
        categoryId: 'CAT-001',
        categoryName: formState.mainCategory || 'Furniture',
        subcategoryId: 'SUB-001',
        subcategoryName: formState.category || 'General',
        itemType: formState.itemType || formState.category || 'General',
        purchaseDate: formState.purchaseDate,
        purchasePrice: priceNum,
        quantity: qtyNum,
        totalAmount: parseFloat((priceNum * qtyNum).toFixed(2)),
        invoiceNumber: formState.invoiceNumber || '',
        invoiceDate: formState.invoiceDate || formState.purchaseDate,
        warrantyExpiry: formState.warranty || '',
        notes: formState.notes || formState.description || 'Initial asset purchase entry.',
      };

      dispatch(addPurchaseHistoryRecord(purchaseTransaction));
      try {
        api.addPurchaseHistory(purchaseTransaction).catch(() => {});
      } catch {
        // Backend optional
      }

      dispatch(
        addNotification({
          title: 'New Asset Registered',
          message: `${formState.name} (${formState.id}) was assigned to ${formState.assignedTo || 'General'} in Room ${formState.room}.`,
          type: 'asset',
          link: `/assets/${formState.id}`,
          department: formState.department,
        })
      );
    }
    setSuccess(true);
  };

  const handleCancel = () => {
    if (clearSelectedFurniture) clearSelectedFurniture();
    navigate('/assets');
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/50">
            <Icon.Check />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
            {selectedFurniture ? 'Asset Profile Updated!' : 'Asset Registered Successfully!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
            Asset <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formState.id}</span> located at <span className="font-semibold text-slate-700 dark:text-slate-300">Room {formState.room}</span> ({formState.assignedTo || 'Unassigned'}).
          </p>
          <div className="flex gap-3 justify-center">
            <Btn variant="secondary" onClick={handleCancel}>View Asset List</Btn>
            {!selectedFurniture && (
              <Btn onClick={() => {
                setSuccess(false);
                if (clearSelectedFurniture) clearSelectedFurniture();
                formDispatch({ type: 'RESET_FORM', payload: createInitialState(null, userDept) });
              }}>Add Another</Btn>
            )}
          </div>
        </div>
      </div>
    );
  }

  const buildingsOptions = ['Engineering Block', 'Science Block', 'Admin Block', 'Library', 'IT Block', 'Management Block', 'Humanities Block', 'Sports & Arts Block'];
  const deptsOptions = ALLOWED_DEPARTMENTS;
  const roomsOptions = ['CS-101', 'CS-102', 'CS-Lab1', 'CS-Lab2', 'ME-101', 'ME-102', 'ME-Workshop', 'CV-101', 'CV-Lab1', 'CV-Survey', 'IT-101', 'IT-Lab1', 'IT-ServerRoom', 'AIDS-101', 'AIDS-Lab1', 'ECE-Lab1', 'ECE-Lab2', 'EEE-101', 'EEE-MachinesLab', 'EEE-PowerLab', 'SH-101', 'SH-PhysicsLab', 'SH-ChemistryLab', 'SH-SmartClass', 'SH-Library', 'SH-Auditorium', 'ADM-101', 'ADM-Hall', 'ADM-Records', 'ADM-ServerRoom'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <button 
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <Icon.ArrowLeft /> Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-none">
            {selectedFurniture ? 'Edit Asset & Custodian Profile' : 'Register New Campus Asset'}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">{formState.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Category Classification */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Category Classification & Specific Type
              </p>
              {canManageCategories && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5" /> Category Admin Enabled
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* PRIMARY CATEGORY DROPDOWN + ADD BUTTON */}
              <div className="flex flex-col justify-between">
                <Select
                  label="Primary Category"
                  value={formState.mainCategory}
                  onChange={e => handleMainCategoryChange(e.target.value)}
                  options={mainCategoryOptions}
                />
                {canManageCategories && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrimaryFormData({
                        name: '',
                        description: '',
                        initialSubCategory: '',
                        initialItemType: '',
                      });
                      setIsAddPrimaryModalOpen(true);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer transition w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Primary Category
                  </button>
                )}
              </div>

              {/* SUBCATEGORY DROPDOWN + ADD BUTTON */}
              <div className="flex flex-col justify-between">
                <Select
                  label="Subcategory"
                  value={formState.category}
                  onChange={e => handleSubCategoryChange(e.target.value)}
                  options={subCategoryOptions.length > 0 ? subCategoryOptions : ['General']}
                />
                {canManageCategories && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubFormData({
                        mainCategory: formState.mainCategory,
                        name: '',
                        description: '',
                        initialItemType: '',
                      });
                      setIsAddSubModalOpen(true);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer transition w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Subcategory
                  </button>
                )}
              </div>

              {/* SPECIFIC ITEM TYPE DROPDOWN + ADD BUTTON */}
              <div className="flex flex-col justify-between">
                <Select
                  label="Specific Item Type"
                  value={formState.itemType}
                  onChange={e => handleInputChange('itemType', e.target.value)}
                  options={itemTypeOptions.length > 0 ? itemTypeOptions : [formState.category || 'Standard Item']}
                />
                {canManageCategories && (
                  <button
                    type="button"
                    onClick={() => {
                      setItemTypeFormData({ name: '' });
                      setIsAddItemTypeModalOpen(true);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer transition w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item Type
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <Input
                  label="Asset Display Name / Model"
                  value={formState.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Student Chair with Writing Pad, Daikin 2.0 Ton Split AC"
                  required
                />
              </div>

              <Input
                label="Quantity Units"
                type="number"
                min="1"
                value={formState.quantity}
                onChange={e => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Technical Specifications & Notes
              </label>
              <textarea
                value={formState.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Serial numbers, material specifications, dimensions, power ratings, etc."
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
          </Card>

          {/* Location & Custodian Section */}
          <Card className="p-5 space-y-4">
            <p className="text-sm font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Where is it Located? (Physical Placement)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Campus Building"
                value={formState.building}
                onChange={e => handleInputChange('building', e.target.value)}
                options={buildingsOptions}
              />
              <Select
                label="Department"
                value={formState.department}
                onChange={e => handleInputChange('department', e.target.value)}
                options={deptsOptions}
              />
              <Select
                label="Room / Lab Assigned"
                value={formState.room}
                onChange={e => handleInputChange('room', e.target.value)}
                options={roomsOptions}
              />
            </div>
          </Card>

          {/* Custodian & In-Charge Details */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
                <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Custodian & In-Charge Details
              </p>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Auto-assign from Staff
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Select Registered Institutional User
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) handleUserSelectAutoFill(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="">-- Choose faculty or staff in-charge --</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role} - {u.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Assigned Person / User Name"
                value={formState.assignedTo}
                onChange={e => handleInputChange('assignedTo', e.target.value)}
                placeholder="e.g. Prof. Anitha Sharma or CS Students"
                required
              />

              <Input
                label="Role / Designation"
                value={formState.assignedRole}
                onChange={e => handleInputChange('assignedRole', e.target.value)}
                placeholder="e.g. Lab In-Charge"
              />

              <Input
                label="Custodian Contact Email"
                type="email"
                value={formState.assignedEmail}
                onChange={e => handleInputChange('assignedEmail', e.target.value)}
                placeholder="e.g. user@nec.edu.in"
              />
            </div>
          </Card>

          {/* Procurement & Purchase Information */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 font-display tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Purchase & Vendor Information</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Commercial procurement data mapped to registered vendors with historical price tracking
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Supplier / Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell India / Godrej Interio"
                    list="vendorsDatalist"
                    value={formState.supplier}
                    onChange={e => handleInputChange('supplier', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <datalist id="vendorsDatalist">
                    {vendorsList.map((v) => (
                      <option key={v.id || v.name} value={v.name} />
                    ))}
                  </datalist>
                </div>

                <Input
                  label="Purchase Date *"
                  type="date"
                  value={formState.purchaseDate}
                  onChange={e => handleInputChange('purchaseDate', e.target.value)}
                  required
                />

                <Input
                  label="Unit Purchase Cost (₹) *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.cost}
                  onChange={e => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                  label="Quantity *"
                  type="number"
                  min="1"
                  value={formState.quantity}
                  onChange={e => handleInputChange('quantity', parseInt(e.target.value, 10) || 1)}
                  required
                />

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Calculated Total Spend
                  </label>
                  <div className="px-3.5 py-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400">
                    ₹{((parseFloat(formState.cost) || 0) * (parseInt(formState.quantity, 10) || 1)).toLocaleString()}
                  </div>
                </div>

                <Input
                  label="Invoice / Bill Number"
                  placeholder="e.g. INV-2026-9041"
                  value={formState.invoiceNumber}
                  onChange={e => handleInputChange('invoiceNumber', e.target.value)}
                />

                <Input
                  label="Warranty Period"
                  placeholder="e.g. 3 Years (Till 2029)"
                  value={formState.warranty}
                  onChange={e => handleInputChange('warranty', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Invoice Date"
                  type="date"
                  value={formState.invoiceDate}
                  onChange={e => handleInputChange('invoiceDate', e.target.value)}
                />

                <Input
                  label="Procurement Remarks / Notes"
                  placeholder="e.g. Bulk institutional academic purchase..."
                  value={formState.notes}
                  onChange={e => handleInputChange('notes', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Status & Actions */}
        <div className="space-y-6">
          {/* Asset Summary Card */}
          <Card className="p-5 space-y-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                {formState.id}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                {formState.quantity || 1} units
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Taxonomy Tier</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {formState.mainCategory || 'Furniture'}
                </span>
                <span className="text-slate-400">›</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  {formState.category}
                </span>
                {formState.itemType && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-medium">
                      {formState.itemType}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Purchase Value</span>
              <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 font-display">₹{(formState.cost || 0).toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Status & Condition</p>
            <div className="space-y-4">
              <Select
                label="Current Condition"
                value={formState.condition}
                onChange={e => handleInputChange('condition', e.target.value)}
                options={['Good', 'Fair', 'Poor', 'Damaged']}
              />
              <Select
                label="Asset Status"
                value={formState.status}
                onChange={e => handleInputChange('status', e.target.value)}
                options={['In Use', 'Available', 'Needs Inspection', 'Retired']}
              />
            </div>
            <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Visual Badges</span>
              <div className="flex gap-2">
                <Badge label={formState.condition} type="condition" />
                <Badge label={formState.status} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Profile Summary</p>
            <div className="space-y-3 text-xs font-semibold">
              {[
                ['Asset ID', formState.id],
                ['Category', `${formState.mainCategory} › ${formState.category}`],
                ['Item Type', formState.itemType],
                ['Location', `Room ${formState.room} (${formState.building})`],
                ['Assigned To', formState.assignedTo || 'Unassigned'],
                ['Quantity', `${formState.quantity} units`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400 dark:text-slate-500">{k}</span>
                  <span className="text-slate-800 dark:text-slate-200 text-right max-w-[160px] truncate">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <Btn type="submit" disabled={!formState.name} className="w-full justify-center">
                {selectedFurniture ? 'Update Asset Profile' : 'Save Asset Profile'}
              </Btn>
              <Btn variant="secondary" onClick={handleCancel} className="w-full justify-center">
                Cancel
              </Btn>
            </div>
          </Card>
        </div>
      </form>

      {/* =========================================================================
          MODAL 1: ADD NEW PRIMARY CATEGORY
         ========================================================================= */}
      {isAddPrimaryModalOpen && (
        <Modal 
          title="Add New Primary Category" 
          onClose={() => setIsAddPrimaryModalOpen(false)}
          defaultSize="max-w-md"
        >
          <form onSubmit={handleAddPrimaryCategorySubmit} className="space-y-4">
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-indigo-900 dark:text-indigo-200">New Category Taxonomy</p>
                <p className="text-indigo-700/80 dark:text-indigo-400">Available to Superadmin & Dept Admin across all departments</p>
              </div>
            </div>

            <Input
              label="Primary Category Name *"
              value={primaryFormData.name}
              onChange={(e) => setPrimaryFormData({ ...primaryFormData, name: e.target.value })}
              placeholder="e.g. Laboratory Equipment, IT Hardware, Sports & Fitness"
              required
              autoFocus
            />

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={primaryFormData.description}
                onChange={(e) => setPrimaryFormData({ ...primaryFormData, description: e.target.value })}
                placeholder="Brief summary of asset types classified under this primary category..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Initial Subcategory"
                value={primaryFormData.initialSubCategory}
                onChange={(e) => setPrimaryFormData({ ...primaryFormData, initialSubCategory: e.target.value })}
                placeholder="e.g. Microscopes (optional)"
              />
              <Input
                label="Initial Item Type"
                value={primaryFormData.initialItemType}
                onChange={(e) => setPrimaryFormData({ ...primaryFormData, initialItemType: e.target.value })}
                placeholder="e.g. Digital Microscope"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 justify-end">
              <Btn 
                type="button" 
                variant="secondary" 
                onClick={() => setIsAddPrimaryModalOpen(false)}
              >
                Cancel
              </Btn>
              <Btn 
                type="submit" 
                disabled={!primaryFormData.name.trim()}
              >
                Create Category
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW SUBCATEGORY
         ========================================================================= */}
      {isAddSubModalOpen && (
        <Modal 
          title="Add New Subcategory" 
          onClose={() => setIsAddSubModalOpen(false)}
          defaultSize="max-w-md"
        >
          <form onSubmit={handleAddSubCategorySubmit} className="space-y-4">
            <div className="p-3 bg-violet-50/70 dark:bg-violet-950/30 rounded-2xl border border-violet-100 dark:border-violet-900/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-violet-900 dark:text-violet-200">Subcategory Tier</p>
                <p className="text-violet-700/80 dark:text-violet-400">Classifies assets under a parent primary category</p>
              </div>
            </div>

            <Select
              label="Parent Primary Category *"
              value={subFormData.mainCategory || formState.mainCategory}
              onChange={(e) => setSubFormData({ ...subFormData, mainCategory: e.target.value })}
              options={mainCategoryOptions}
            />

            <Input
              label="Subcategory Name *"
              value={subFormData.name}
              onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
              placeholder="e.g. Ergonomic Chairs, Laser Printers, Power Tools"
              required
              autoFocus
            />

            <Input
              label="Initial Item Type (optional)"
              value={subFormData.initialItemType}
              onChange={(e) => setSubFormData({ ...subFormData, initialItemType: e.target.value })}
              placeholder="e.g. Heavy Duty Executive Chair"
            />

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wide">
                Description (optional)
              </label>
              <textarea
                value={subFormData.description}
                onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                placeholder="Specific characteristics or use-cases of this subcategory..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 justify-end">
              <Btn 
                type="button" 
                variant="secondary" 
                onClick={() => setIsAddSubModalOpen(false)}
              >
                Cancel
              </Btn>
              <Btn 
                type="submit" 
                disabled={!subFormData.name.trim()}
              >
                Add Subcategory
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: ADD NEW SPECIFIC ITEM TYPE
         ========================================================================= */}
      {isAddItemTypeModalOpen && (
        <Modal 
          title="Add Specific Item Type" 
          onClose={() => setIsAddItemTypeModalOpen(false)}
          defaultSize="max-w-md"
        >
          <form onSubmit={handleAddItemTypeSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">Taxonomy Path</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {formState.mainCategory} › {formState.category}
                </p>
              </div>
            </div>

            <Input
              label="Item Type Name *"
              value={itemTypeFormData.name}
              onChange={(e) => setItemTypeFormData({ name: e.target.value })}
              placeholder="e.g. Pneumatic Lab Stool, 4K Interactive Touch Panel"
              required
              autoFocus
            />

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 justify-end">
              <Btn 
                type="button" 
                variant="secondary" 
                onClick={() => setIsAddItemTypeModalOpen(false)}
              >
                Cancel
              </Btn>
              <Btn 
                type="submit" 
                disabled={!itemTypeFormData.name.trim()}
              >
                Add Item Type
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
