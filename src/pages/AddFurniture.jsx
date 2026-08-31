import React, { useReducer, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { addFurniture, editFurniture } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { Card, Btn, Input, Select, Badge, Icon } from '../components/UIComponents';

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

export const AddFurniture = ({ selectedFurniture: propSelected, clearSelectedFurniture }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);

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
      dispatch(
        addNotification({
          title: 'Asset Updated',
          message: `${formState.name} (${formState.id}) was modified by ${currentUser?.name || 'Admin'}.`,
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
          message: `${formState.name} (${formState.id}) was registered in ${formState.department} (Room ${formState.room}).`,
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
  const roomsOptions = ['CS-101', 'CS-102', 'CS-Lab1', 'PH-201', 'CH-301', 'ME-101', 'ECE-Lab2', 'LIB-01', 'ADM-Hall', 'PH-202'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <Icon.ArrowLeft /> Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-none">
            {selectedFurniture ? 'Edit Asset Profile' : 'Register New Asset'}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">{formState.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Asset Name"
                value={formState.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="e.g. Ergonomic Office Chair"
                required
              />
              <Select
                label="Category"
                value={formState.category}
                onChange={e => handleInputChange('category', e.target.value)}
                options={['Desk', 'Chair', 'Table', 'Board', 'Storage', 'Electronics', 'Equipment', 'Other']}
              />
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={formState.quantity}
                onChange={e => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
              <Input
                label="Unit Cost (₹)"
                type="number"
                value={formState.cost}
                onChange={e => handleInputChange('cost', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Description & Specifications</label>
              <textarea
                value={formState.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Detailed specifications, dimensions, serial number, etc."
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Placement & Location</p>
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
              />
              <Select
                label="Room Assigned"
                value={formState.room}
                onChange={e => handleInputChange('room', e.target.value)}
                options={roomsOptions}
              />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Procurement & Warranty</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                placeholder="e.g. FurnishPro Ltd"
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

        {/* Sidebar Status & Actions */}
        <div className="space-y-6">
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
                label="Status"
                value={formState.status}
                onChange={e => handleInputChange('status', e.target.value)}
                options={['Available', 'In Use', 'Needs Inspection', 'Retired']}
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
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 font-display tracking-tight">Form Overview</p>
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
