import React, { useReducer, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFurniture, editFurniture } from '../store/furnitureSlice';
import { Card, Btn, Input, Select, Badge, Icon } from '../components/UIComponents';
//milton
const createInitialState = (editAsset, userDept) => {
  if (editAsset) return editAsset;
  return {
    id: 'AST-' + Math.floor(100 + Math.random() * 900),
    name: '',
    category: 'Desk',
    description: '',
    building: 'Engineering Block',
    department: userDept,
    room: 'CS-101',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    cost: 0,
    supplier: '',
    warranty: '',
    condition: 'Good',
    status: 'Available',
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

export const AddFurniture = ({ setPage, selectedFurniture, clearSelectedFurniture }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  const [success, setSuccess] = useState(false);
  const userDept = currentUser?.department || 'Computer Science';

  const [formState, formDispatch] = useReducer(
    formReducer,
    selectedFurniture,
    (selected) => createInitialState(selected, userDept)
  );

  useEffect(() => {
    if (selectedFurniture) {
      formDispatch({ type: 'LOAD_EDIT', payload: selectedFurniture });
    }
  }, [selectedFurniture]);

  const handleInputChange = (field, value) => {
    formDispatch({ type: 'SET_FIELD', field, value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    if (selectedFurniture) {
      dispatch(editFurniture(formState));
    } else {
      dispatch(addFurniture(formState));
    }
    setSuccess(true);
  };

  const handleCancel = () => {
    clearSelectedFurniture();
    setPage('furniture-list');
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/50">
            <Icon.Check />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
            {selectedFurniture ? 'Asset Updated!' : 'Asset Registered!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
            Asset <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formState.id}</span> was saved to database.
          </p>
          <div className="flex gap-3 justify-center">
            <Btn variant="secondary" onClick={handleCancel}>View Asset List</Btn>
            {!selectedFurniture && (
              <Btn onClick={() => {
                setSuccess(false);
                clearSelectedFurniture();
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
  const roomsOptions = ['CS-101', 'CS-102', 'CS-Lab1', 'PH-201', 'CH-301', 'ME-101', 'ECE-Lab2', 'LIB-01', 'ADM-Hall', 'PH-202'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleCancel} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250 cursor-pointer transition">
          <Icon.ArrowLeft /> Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-none">
            {selectedFurniture ? 'Edit Asset' : 'Add Asset'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {selectedFurniture ? 'Update asset registry profiles' : 'Register a new asset to campus database'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-750 dark:text-slate-250 mb-4 font-display tracking-tight">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Asset ID" value={formState.id} readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-400 font-mono font-bold" />
              <Input
                label="Asset Name *"
                value={formState.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="e.g. Faculty Chair"
                required
              />
              <Select
                label="Category *"
                value={formState.category}
                onChange={e => handleInputChange('category', e.target.value)}
                options={['Desk', 'Chair', 'Table', 'Board', 'Electronics', 'Storage', 'Equipment', 'Other']}
              />
              <Input
                label="Quantity *"
                type="number"
                value={formState.quantity}
                onChange={e => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                min="1"
                required
              />
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase">Description</label>
                <textarea
                  value={formState.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  rows={3}
                  placeholder="Asset specifications, dimensions, features..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-805 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>
            </div>
          </Card>

          {/* Location details */}
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-750 dark:text-slate-250 mb-4 font-display tracking-tight">Location Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Building"
                value={formState.building}
                onChange={e => handleInputChange('building', e.target.value)}
                options={buildingsOptions}
              />
              <Select
                label="Department"
                value={formState.department}
                onChange={e => handleInputChange('department', e.target.value)}
                options={deptsOptions}
                disabled={currentUser?.role !== 'superadmin'}
              />
              <Select
                label="Room"
                value={formState.room}
                onChange={e => handleInputChange('room', e.target.value)}
                options={roomsOptions}
              />
            </div>
          </Card>

          {/* Financials */}
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-750 dark:text-slate-250 mb-4 font-display tracking-tight">Purchase & Warranty Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Purchase Date"
                type="date"
                value={formState.purchaseDate}
                onChange={e => handleInputChange('purchaseDate', e.target.value)}
              />
              <Input
                label="Cost (₹) *"
                type="number"
                value={formState.cost}
                onChange={e => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                placeholder="Cost amount in INR"
                required
              />
              <Input
                label="Supplier"
                value={formState.supplier}
                onChange={e => handleInputChange('supplier', e.target.value)}
                placeholder="e.g. FurnishPro India"
              />
              <Input
                label="Warranty Expiry"
                type="date"
                value={formState.warranty}
                onChange={e => handleInputChange('warranty', e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* Condition details */}
        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-755 dark:text-slate-250 mb-4 font-display tracking-tight">Condition & Status</p>
            <div className="space-y-4">
              <Select
                label="Condition"
                value={formState.condition}
                onChange={e => handleInputChange('condition', e.target.value)}
                options={['Good', 'Fair', 'Poor', 'Damaged']}
              />
              <Select
                label="Status"
                value={formState.status}
                onChange={e => handleInputChange('status', e.target.value)}
                options={['Available', 'In Use', 'Needs Inspection', 'Retired']}
              />
            </div>
            <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Visual Badges</span>
              <div className="flex gap-2">
                <Badge label={formState.condition} type="condition" />
                <Badge label={formState.status} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-755 dark:text-slate-250 mb-4 font-display tracking-tight">Form Overview</p>
            <div className="space-y-3.5 text-xs font-semibold">
              {[
                ['Asset ID', formState.id],
                ['Name', formState.name || '—'],
                ['Category', formState.category],
                ['Department', formState.department],
                ['Room', formState.room],
                ['Quantity', formState.quantity],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2.5">
                  <span className="text-slate-400 dark:text-slate-500">{k}</span>
                  <span className="text-slate-800 dark:text-slate-200">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <Btn type="submit" disabled={!formState.name} className="w-full justify-center">
                {selectedFurniture ? 'Update Asset' : 'Save Asset'}
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
