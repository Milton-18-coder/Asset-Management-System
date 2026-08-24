import { createSlice } from '@reduxjs/toolkit';

const getInitialInspections = () => {
  const saved = localStorage.getItem('inspections_list');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const initial = [
    { id: 'INS-001', assetId: 'AST-003', furniture: 'LCD Projector', location: 'CS-101', condition: 'Fair', inspector: 'Mr. Ravi Shankar', date: '2024-08-05', notes: 'Lamp needs replacement within 2 months.' },
    { id: 'INS-002', assetId: 'AST-009', furniture: 'Student Chair', location: 'ME-101', condition: 'Poor', inspector: 'Ms. Geeta Nair', date: '2024-08-10', notes: 'Multiple chairs have broken legs. Recommend replacement.' },
    { id: 'INS-003', assetId: 'AST-012', furniture: 'Oscilloscope', location: 'ECE-Lab2', condition: 'Damaged', inspector: 'Mr. Ravi Shankar', date: '2024-08-12', notes: 'Display screen cracked. Non-functional. Write-off recommended.' },
    { id: 'INS-004', assetId: 'AST-006', furniture: 'Computer Workstation', location: 'CS-Lab1', condition: 'Good', inspector: 'Prof. Suresh Babu', date: '2024-08-13', notes: 'All systems operational. Software updated.' },
    { id: 'INS-005', assetId: 'AST-010', furniture: 'Smart Board', location: 'PH-202', condition: 'Good', inspector: 'Ms. Geeta Nair', date: '2024-08-15', notes: 'Fully functional. Touch calibration done.' }
  ];
  localStorage.setItem('inspections_list', JSON.stringify(initial));
  return initial;
};

const inspectionsSlice = createSlice({
  name: 'inspections',
  initialState: { list: getInitialInspections() },
  reducers: {
    addInspection: (state, action) => {
      state.list.unshift(action.payload);
      localStorage.setItem('inspections_list', JSON.stringify(state.list));
    }
  }
});

export const { addInspection } = inspectionsSlice.actions;
export default inspectionsSlice.reducer;
