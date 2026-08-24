import { createSlice } from '@reduxjs/toolkit';

const getInitialTransfers = () => {
  const saved = localStorage.getItem('transfers_list');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const initial = [
    { id: 'TRF-001', assetId: 'AST-003', furniture: 'LCD Projector', source: 'CS-101', destination: 'CS-102', requester: 'Prof. Anitha Sharma', date: '2024-08-10', status: 'Completed' },
    { id: 'TRF-002', assetId: 'AST-009', furniture: 'Student Chair (5 units)', source: 'ME-101', destination: 'CS-101', requester: 'Prof. Kavitha Raj', date: '2024-08-14', status: 'Approved' },
    { id: 'TRF-003', assetId: 'AST-006', furniture: 'Computer Workstation (2 units)', source: 'CS-Lab1', destination: 'ECE-Lab2', requester: 'Prof. Ramesh Nair', date: '2024-08-15', status: 'Pending' },
    { id: 'TRF-004', assetId: 'AST-004', furniture: 'Whiteboard', source: 'PH-201', destination: 'PH-202', requester: 'Prof. Dinesh Kumar', date: '2024-08-08', status: 'Rejected' },
    { id: 'TRF-005', assetId: 'AST-011', furniture: 'Filing Cabinet', source: 'ADM-102', destination: 'ADM-Hall', requester: 'Ms. Priya Mehta', date: '2024-08-16', status: 'Pending' }
  ];
  localStorage.setItem('transfers_list', JSON.stringify(initial));
  return initial;
};

const transfersSlice = createSlice({
  name: 'transfers',
  initialState: { list: getInitialTransfers() },
  reducers: {
    addTransfer: (state, action) => {
      state.list.unshift(action.payload);
      localStorage.setItem('transfers_list', JSON.stringify(state.list));
    },
    approveTransfer: (state, action) => {
      const trans = state.list.find(t => t.id === action.payload);
      if (trans) {
        trans.status = 'Approved';
        localStorage.setItem('transfers_list', JSON.stringify(state.list));
      }
    },
    rejectTransfer: (state, action) => {
      const trans = state.list.find(t => t.id === action.payload);
      if (trans) {
        trans.status = 'Rejected';
        localStorage.setItem('transfers_list', JSON.stringify(state.list));
      }
    },
    completeTransfer: (state, action) => {
      const trans = state.list.find(t => t.id === action.payload);
      if (trans) {
        trans.status = 'Completed';
        localStorage.setItem('transfers_list', JSON.stringify(state.list));
      }
    }
  }
});

export const { addTransfer, approveTransfer, rejectTransfer, completeTransfer } = transfersSlice.actions;
export default transfersSlice.reducer;
