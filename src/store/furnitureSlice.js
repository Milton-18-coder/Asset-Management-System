import { createSlice } from '@reduxjs/toolkit';

const getInitialFurniture = () => {
  const saved = localStorage.getItem('furniture_list');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const initial = [
    { id: 'AST-001', name: 'Student Desk', category: 'Desk', building: 'Engineering Block', department: 'Computer Science', room: 'CS-101', condition: 'Good', status: 'In Use', purchaseDate: '2022-06-15', cost: 4500, supplier: 'FurnishPro Ltd', warranty: '2025-06-15', quantity: 30, description: 'Standard student writing desk' },
    { id: 'AST-002', name: 'Faculty Chair', category: 'Chair', building: 'Engineering Block', department: 'Computer Science', room: 'CS-102', condition: 'Good', status: 'In Use', purchaseDate: '2022-06-15', cost: 3200, supplier: 'OfficeComfort Co', warranty: '2025-06-15', quantity: 2, description: 'Ergonomic faculty chair' },
    { id: 'AST-003', name: 'LCD Projector', category: 'Electronics', building: 'Engineering Block', department: 'Computer Science', room: 'CS-101', condition: 'Fair', status: 'Needs Inspection', purchaseDate: '2021-03-10', cost: 45000, supplier: 'TechVision India', warranty: '2024-03-10', quantity: 1, description: 'Full HD classroom projector' },
    { id: 'AST-004', name: 'Whiteboard', category: 'Board', building: 'Science Block', department: 'Physics', room: 'PH-201', condition: 'Good', status: 'In Use', purchaseDate: '2023-01-20', cost: 8500, supplier: 'EduSupply Co', warranty: '2028-01-20', quantity: 1, description: 'Large magnetic whiteboard' },
    { id: 'AST-005', name: 'Lab Bench', category: 'Table', building: 'Science Block', department: 'Chemistry', room: 'CH-301', condition: 'Fair', status: 'In Use', purchaseDate: '2020-08-05', cost: 12000, supplier: 'LabFurnish Ltd', warranty: '2023-08-05', quantity: 15, description: 'Chemical resistant lab bench' },
    { id: 'AST-006', name: 'Computer Workstation', category: 'Electronics', building: 'Engineering Block', department: 'Computer Science', room: 'CS-Lab1', condition: 'Good', status: 'In Use', purchaseDate: '2023-07-12', cost: 65000, supplier: 'Dell India', warranty: '2026-07-12', quantity: 40, description: 'Core i7 workstation for labs' },
    { id: 'AST-007', name: 'Bookshelf', category: 'Storage', building: 'Library', department: 'Administration', room: 'LIB-01', condition: 'Good', status: 'In Use', purchaseDate: '2019-04-22', cost: 6000, supplier: 'WoodCraft Furniture', warranty: '2024-04-22', quantity: 50, description: 'Wooden bookshelf 6-tier' },
    { id: 'AST-008', name: 'Conference Table', category: 'Table', building: 'Admin Block', department: 'Administration', room: 'ADM-Hall', condition: 'Good', status: 'Available', purchaseDate: '2022-11-30', cost: 35000, supplier: 'PremiumFurnish', warranty: '2027-11-30', quantity: 1, description: '12-seater conference table' },
    { id: 'AST-009', name: 'Student Chair', category: 'Chair', building: 'Engineering Block', department: 'Mechanical', room: 'ME-101', condition: 'Poor', status: 'Needs Inspection', purchaseDate: '2018-09-01', cost: 1200, supplier: 'LocalFurnish Co', warranty: '2021-09-01', quantity: 45, description: 'Standard plastic chair' },
    { id: 'AST-010', name: 'Smart Board', category: 'Electronics', building: 'Science Block', department: 'Physics', room: 'PH-202', condition: 'Good', status: 'In Use', purchaseDate: '2023-12-01', cost: 125000, supplier: 'SmartTech India', warranty: '2028-12-01', quantity: 1, description: 'Interactive smart board 86"' },
    { id: 'AST-011', name: 'Filing Cabinet', category: 'Storage', building: 'Admin Block', department: 'Administration', room: 'ADM-102', condition: 'Good', status: 'Available', purchaseDate: '2021-05-14', cost: 9500, supplier: 'OfficeWorld', warranty: '2026-05-14', quantity: 8, description: '4-drawer steel filing cabinet' },
    { id: 'AST-012', name: 'Oscilloscope', category: 'Equipment', building: 'Engineering Block', department: 'ECE', room: 'ECE-Lab2', condition: 'Damaged', status: 'Needs Inspection', purchaseDate: '2019-10-08', cost: 28000, supplier: 'LabEquip India', warranty: '2022-10-08', quantity: 5, description: 'Digital storage oscilloscope' }
  ];
  localStorage.setItem('furniture_list', JSON.stringify(initial));
  return initial;
};

const furnitureSlice = createSlice({
  name: 'furniture',
  initialState: { list: getInitialFurniture() },
  reducers: {
    addFurniture: (state, action) => {
      state.list.push(action.payload);
      localStorage.setItem('furniture_list', JSON.stringify(state.list));
    },
    editFurniture: (state, action) => {
      const idx = state.list.findIndex(f => f.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      }
    },
    deleteFurniture: (state, action) => {
      state.list = state.list.filter(f => f.id !== action.payload);
      localStorage.setItem('furniture_list', JSON.stringify(state.list));
    },
    updateFurnitureLocation: (state, action) => {
      const item = state.list.find(f => f.id === action.payload.id);
      if (item) {
        item.room = action.payload.room;
        item.building = action.payload.building;
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      }
    },
    updateFurnitureCondition: (state, action) => {
      const item = state.list.find(f => f.id === action.payload.id);
      if (item) {
        item.condition = action.payload.condition;
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      }
    }
  }
});

export const { addFurniture, editFurniture, deleteFurniture, updateFurnitureLocation, updateFurnitureCondition } = furnitureSlice.actions;
export default furnitureSlice.reducer;
