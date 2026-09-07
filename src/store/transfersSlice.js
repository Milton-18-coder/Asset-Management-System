import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabaseClient';

export const mapDbToTransfer = (row) => ({
  id: row.code || `TRF-${String(row.id).padStart(3, '0')}`,
  db_id: row.id,
  assetId: row.asset_id || row.assetId || '',
  furniture: row.furniture_name || row.furniture || '',
  source: row.source_room || row.source || '',
  destination: row.destination_room || row.destination || '',
  requester: row.requester || '',
  date: row.request_date || row.date || new Date().toISOString().split('T')[0],
  status: row.status || 'Pending',
});

export const mapTransferToDb = (item) => ({
  code: item.id,
  asset_id: item.assetId,
  furniture_name: item.furniture,
  source_room: item.source,
  destination_room: item.destination,
  requester: item.requester,
  request_date: item.date,
  status: item.status || 'Pending',
});

// Async Thunk: Fetch Transfers from Supabase
export const fetchTransfersFromSupabase = createAsyncThunk(
  'transfers/fetchTransfers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbToTransfer);
    } catch (err) {
      console.warn('Supabase transfers fetch failed, using local/cached state:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Add Transfer to Supabase
export const addTransferToSupabase = createAsyncThunk(
  'transfers/addTransfer',
  async (transferData, { rejectWithValue }) => {
    try {
      const dbPayload = mapTransferToDb(transferData);
      const { data, error } = await supabase
        .from('transfers')
        .insert([dbPayload])
        .select();

      if (error) throw error;
      return mapDbToTransfer(data[0]);
    } catch (err) {
      console.error('Supabase add transfer failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Update Transfer Status in Supabase
export const updateTransferStatusInSupabase = createAsyncThunk(
  'transfers/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .update({ status })
        .eq('code', id)
        .select();

      if (error) throw error;
      return { id, status, updated: data[0] ? mapDbToTransfer(data[0]) : null };
    } catch (err) {
      console.error('Supabase transfer status update failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

const getInitialTransfers = () => {
  const saved = localStorage.getItem('transfers_list');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  const initial = [
    { id: 'TRF-001', assetId: 'AST-003', furniture: 'LCD Projector', source: 'CS-101', destination: 'CS-102', requester: 'Prof. Anitha Sharma', date: '2026-08-10', status: 'Completed' },
    { id: 'TRF-002', assetId: 'AST-009', furniture: 'Student Chair (5 units)', source: 'ME-101', destination: 'CS-101', requester: 'Prof. Kavitha Raj', date: '2026-08-14', status: 'Approved' },
    { id: 'TRF-003', assetId: 'AST-006', furniture: 'Dell Workstation Tower (2 units)', source: 'CS-Lab1', destination: 'ECE-Lab2', requester: 'Prof. Ramesh Nair', date: '2026-08-20', status: 'Pending' },
    { id: 'TRF-004', assetId: 'AST-004', furniture: 'Magnetic Ceramic Whiteboard', source: 'PH-201', destination: 'PH-202', requester: 'Prof. Dinesh Kumar', date: '2026-08-22', status: 'Rejected' },
    { id: 'TRF-005', assetId: 'AST-007', furniture: 'Steel Filing Cabinet', source: 'ADM-102', destination: 'ADM-Hall', requester: 'Ms. Priya Mehta', date: '2026-08-25', status: 'Completed' },
    { id: 'TRF-006', assetId: 'AST-010', furniture: 'Interactive 75" Smart Board', source: 'PH-202', destination: 'CS-101', requester: 'Prof. Suresh Babu', date: '2026-08-28', status: 'Pending' },
    { id: 'TRF-007', assetId: 'AST-001', furniture: 'Ergonomic Mesh Task Chair (4 units)', source: 'CS-Lab1', destination: 'CS-102', requester: 'Prof. Anitha Sharma', date: '2026-08-30', status: 'Approved' },
    { id: 'TRF-008', assetId: 'AST-015', furniture: 'Solid Oak Library Study Carrel (3 units)', source: 'LIB-01', destination: 'PH-201', requester: 'Dr. Nalini Patel', date: '2026-09-01', status: 'Pending' },
    { id: 'TRF-009', assetId: 'AST-008', furniture: 'Modular Lab Workstation', source: 'CS-Lab1', destination: 'ME-101', requester: 'Prof. Kavitha Raj', date: '2026-09-02', status: 'Approved' },
    { id: 'TRF-010', assetId: 'AST-014', furniture: 'Analytical Electronic Balance', source: 'CH-301', destination: 'PH-201', requester: 'Dr. Lalitha Devi', date: '2026-09-03', status: 'Rejected' },
    { id: 'TRF-011', assetId: 'AST-005', furniture: 'Split Air Conditioner (2.0 Ton)', source: 'ECE-Lab2', destination: 'ADM-Hall', requester: 'Dr. Rajesh Kumar', date: '2026-09-04', status: 'Completed' },
    { id: 'TRF-012', assetId: 'AST-012', furniture: 'Digital Storage Oscilloscope', source: 'ECE-Lab2', destination: 'CS-Lab1', requester: 'Prof. Ramesh Nair', date: '2026-09-05', status: 'Pending' },
    { id: 'TRF-013', assetId: 'AST-002', furniture: 'Teak Wood Conference Table', source: 'ADM-Hall', destination: 'LIB-01', requester: 'Ms. Priya Mehta', date: '2026-09-06', status: 'Pending' }
  ];
  localStorage.setItem('transfers_list', JSON.stringify(initial));
  return initial;
};

const transfersSlice = createSlice({
  name: 'transfers',
  initialState: { 
    list: getInitialTransfers(),
    loading: false,
    error: null,
  },
  reducers: {
    setTransfersList: (state, action) => {
      state.list = action.payload;
      localStorage.setItem('transfers_list', JSON.stringify(state.list));
    },
    addTransfer: (state, action) => {
      const exists = state.list.some(t => t.id === action.payload.id);
      if (!exists) {
        state.list.unshift(action.payload);
        localStorage.setItem('transfers_list', JSON.stringify(state.list));
      }
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfersFromSupabase.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransfersFromSupabase.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.list = action.payload;
          localStorage.setItem('transfers_list', JSON.stringify(state.list));
        }
      })
      .addCase(fetchTransfersFromSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTransferToSupabase.fulfilled, (state, action) => {
        const exists = state.list.some(t => t.id === action.payload.id);
        if (!exists) {
          state.list.unshift(action.payload);
        } else {
          const idx = state.list.findIndex(t => t.id === action.payload.id);
          state.list[idx] = action.payload;
        }
        localStorage.setItem('transfers_list', JSON.stringify(state.list));
      })
      .addCase(updateTransferStatusInSupabase.fulfilled, (state, action) => {
        const trans = state.list.find(t => t.id === action.payload.id);
        if (trans) {
          trans.status = action.payload.status;
          localStorage.setItem('transfers_list', JSON.stringify(state.list));
        }
      });
  }
});

export const { setTransfersList, addTransfer, approveTransfer, rejectTransfer, completeTransfer } = transfersSlice.actions;
export default transfersSlice.reducer;

