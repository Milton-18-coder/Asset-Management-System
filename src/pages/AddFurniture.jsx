import React, { useReducer, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { addFurniture, editFurniture } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { Card, Btn, Input, Select, Badge, Icon } from '../components/UIComponents';
import { 
  ASSET_CATEGORIES, 
  MAIN_CATEGORIES,
  getItemTypes
} from '../constants/assetCategories';
import { User, MapPin } from 'lucide-react';

const createInitialState = (editAsset, userDept) => {
  if (editAsset) {
    return {
      id: editAsset.id,
      name: editAsset.name || '',
      mainCategory: editAsset.mainCategory || 'Furniture',
      category: editAsset.category || 'Chair',
      itemType: editAsset.itemType || 'Student Chair',
      description: editAsset.description || '',
      building: editAsset.building || 'Engineering Block',
      department: editAsset.department || userDept,
      room: editAsset.room || 'CS-101',
      assignedTo: editAsset.assignedTo || '',
      assignedRole: editAsset.assignedRole || 'Faculty In-Charge',
      assignedEmail: editAsset.assignedEmail || '',
      quantity: editAsset.quantity || 1,
      purchaseDate: editAsset.purchaseDate || new Date().toISOString().split('T')[0],
      cost: editAsset.cost || 0,
      supplier: editAsset.supplier || '',
      warranty: editAsset.warranty || '',
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
    department: userDept,
    room: 'CS-101',
    assignedTo: '',
    assignedRole: 'Faculty In-Charge',
    assignedEmail: '',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    cost: 0,
    supplier: '',
    warranty: '',
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

  const selectedFurniture = propSelected || (id ? furnitureList.find((f) => f.id === id) : null);

  const [success, setSuccess] = useState(false);
  const userDept = currentUser?.department || 'Computer Science';

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

  // Subcategories based on chosen Main Category
  const subCategoryOptions = useMemo(() => {
    const main = ASSET_CATEGORIES[formState.mainCategory];
    if (!main) return ['Chair'];
    return Object.keys(main.subCategories);
  }, [formState.mainCategory]);

  // Item types based on Subcategory
  const itemTypeOptions = useMemo(() => {
    return getItemTypes(formState.mainCategory, formState.category);
  }, [formState.mainCategory, formState.category]);

  const handleMainCategoryChange = (mainCat) => {
    handleInputChange('mainCategory', mainCat);
    const main = ASSET_CATEGORIES[mainCat];
    const firstSub = main ? Object.keys(main.subCategories)[0] : 'Chair';
    handleInputChange('category', firstSub);
    const firstItems = getItemTypes(mainCat, firstSub);
    handleInputChange('itemType', firstItems[0] || '');
  };

  const handleSubCategoryChange = (subCat) => {
    handleInputChange('category', subCat);
    const items = getItemTypes(formState.mainCategory, subCat);
    handleInputChange('itemType', items[0] || '');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    if (selectedFurniture) {
      dispatch(editFurniture(formState));
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
  const deptsOptions = ['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Physics', 'Chemistry', 'Administration', 'Mathematics', 'Civil Engineering'];
  const roomsOptions = ['CS-101', 'CS-102', 'CS-Lab1', 'PH-201', 'CH-301', 'ME-101', 'ECE-Lab2', 'LIB-01', 'ADM-Hall', 'ADM-101', 'ADM-102', 'PH-202'];

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
            <p className="text-sm font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
              <span className="text-base">🗂️</span> Category Classification & Specific Type
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Primary Category"
                value={formState.mainCategory}
                onChange={e => handleMainCategoryChange(e.target.value)}
                options={MAIN_CATEGORIES}
              />

              <Select
                label="Subcategory"
                value={formState.category}
                onChange={e => handleSubCategoryChange(e.target.value)}
                options={subCategoryOptions}
              />

              <Select
                label="Specific Item Type"
                value={formState.itemType}
                onChange={e => handleInputChange('itemType', e.target.value)}
                options={itemTypeOptions.length > 0 ? itemTypeOptions : [formState.category]}
              />
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

          {/* Whom the People Using It? */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
                <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Whom the People Using It? (Custodian / In-Charge)
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

          {/* Procurement & Warranty */}
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">
              Procurement & Warranty Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                label="Unit Cost (₹)"
                type="number"
                value={formState.cost}
                onChange={e => handleInputChange('cost', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Purchase Date"
                type="date"
                value={formState.purchaseDate}
                onChange={e => handleInputChange('purchaseDate', e.target.value)}
              />
              <Input
                label="Supplier / Vendor"
                value={formState.supplier}
                onChange={e => handleInputChange('supplier', e.target.value)}
                placeholder="e.g. Godrej Interio"
              />
              <Input
                label="Warranty Period"
                value={formState.warranty}
                onChange={e => handleInputChange('warranty', e.target.value)}
                placeholder="e.g. 3 Years (Till 2027)"
              />
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
    </div>
  );
};
