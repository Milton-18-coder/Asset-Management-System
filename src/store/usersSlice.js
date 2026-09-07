import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabaseClient';

export const mapDbToUser = (row) => ({
  id: row.code || (row.id ? `U${String(row.id).padStart(2, '0')}` : 'U01'),
  db_id: row.id,
  name: row.name || '',
  username: row.username || '',
  role: row.role || 'Dept Admin',
  department: row.department || 'General',
  status: row.status || 'Active',
  email: row.email || '',
  phone: row.phone || '',
  office: row.office || '',
});

export const mapUserToDb = (item) => ({
  code: item.id,
  name: item.name,
  username: item.username,
  role: item.role,
  department: item.department,
  status: item.status || 'Active',
  email: item.email,
  phone: item.phone,
  office: item.office,
});

// Async Thunk: Fetch Users / Profiles from Supabase
export const fetchUsersFromSupabase = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToUser);
    } catch (err) {
      console.warn('Supabase profiles fetch failed, using local/cached state:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Add User / Profile to Supabase
export const addUserToSupabase = createAsyncThunk(
  'users/addUser',
  async (userData, { rejectWithValue }) => {
    try {
      const dbPayload = mapUserToDb(userData);
      const { data, error } = await supabase
        .from('profiles')
        .insert([dbPayload])
        .select();

      if (error) throw error;
      return mapDbToUser(data[0]);
    } catch (err) {
      console.error('Supabase add profile failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Update User in Supabase
export const updateUserInSupabase = createAsyncThunk(
  'users/updateUser',
  async (userData, { rejectWithValue }) => {
    try {
      const dbPayload = mapUserToDb(userData);
      const { data, error } = await supabase
        .from('profiles')
        .update(dbPayload)
        .eq('code', userData.id)
        .select();

      if (error) throw error;
      return mapDbToUser(data[0]);
    } catch (err) {
      console.error('Supabase update profile failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Delete User from Supabase
export const deleteUserFromSupabase = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('code', userId);

      if (error) throw error;
      return userId;
    } catch (err) {
      console.error('Supabase delete profile failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

const getInitialUsers = () => {
  const saved = localStorage.getItem('users_database');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 8) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  const initial = [
    { id: 'U01', name: 'Dr. Rajesh Kumar', username: 'superadmin', role: 'Super Admin', department: 'Administration', status: 'Active', email: 'rajesh.kumar@nec.edu.in', phone: '+91 98401 23456', office: 'ADM-101' },
    { id: 'U02', name: 'Prof. Anitha Sharma', username: 'deptadmin', role: 'Dept Admin', department: 'Computer Science', status: 'Active', email: 'anitha.sharma@nec.edu.in', phone: '+91 98402 34567', office: 'CS-101' },
    { id: 'U03', name: 'Prof. Suresh Babu', username: 'cs_admin', role: 'Dept Admin', department: 'Computer Science', status: 'Active', email: 'suresh.babu@nec.edu.in', phone: '+91 98403 45678', office: 'CS-Lab1' },
    { id: 'U04', name: 'Prof. Ramesh Nair', username: 'ece_admin', role: 'Dept Admin', department: 'ECE', status: 'Active', email: 'ramesh.nair@nec.edu.in', phone: '+91 98404 56789', office: 'ECE-Lab2' },
    { id: 'U05', name: 'Prof. Kavitha Raj', username: 'me_admin', role: 'Dept Admin', department: 'Mechanical', status: 'Active', email: 'kavitha.raj@nec.edu.in', phone: '+91 98405 67890', office: 'ME-101' },
    { id: 'U06', name: 'Prof. Dinesh Kumar', username: 'phy_admin', role: 'Dept Admin', department: 'Physics', status: 'Active', email: 'dinesh.kumar@nec.edu.in', phone: '+91 98406 78901', office: 'PH-201' },
    { id: 'U07', name: 'Dr. Lalitha Devi', username: 'chem_admin', role: 'Dept Admin', department: 'Chemistry', status: 'Active', email: 'lalitha.devi@nec.edu.in', phone: '+91 98408 90123', office: 'CH-301' },
    { id: 'U08', name: 'Mr. Ravi Shankar', username: 'auditor', role: 'Inspector / Auditor', department: 'Administration', status: 'Active', email: 'ravi.shankar@nec.edu.in', phone: '+91 98407 89012', office: 'ADM-Audits' },
    { id: 'U09', name: 'Ms. Priya Mehta', username: 'estate_mgr', role: 'Staff In-Charge', department: 'Administration', status: 'Active', email: 'priya.mehta@nec.edu.in', phone: '+91 98409 01234', office: 'ADM-102' },
    { id: 'U10', name: 'Ms. Geeta Nair', username: 'lib_admin', role: 'Staff In-Charge', department: 'Library', status: 'Active', email: 'geeta.nair@nec.edu.in', phone: '+91 98410 12345', office: 'LIB-01' }
  ];
  localStorage.setItem('users_database', JSON.stringify(initial));
  return initial;
};

const usersSlice = createSlice({
  name: 'users',
  initialState: { 
    list: getInitialUsers(),
    loading: false,
    error: null,
  },
  reducers: {
    setUsersList: (state, action) => {
      state.list = action.payload;
      localStorage.setItem('users_database', JSON.stringify(state.list));
    },
    addUser: (state, action) => {
      const exists = state.list.some(u => u.id === action.payload.id);
      if (!exists) {
        state.list.push(action.payload);
        localStorage.setItem('users_database', JSON.stringify(state.list));
      }
    },
    editUser: (state, action) => {
      const idx = state.list.findIndex(u => u.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
        localStorage.setItem('users_database', JSON.stringify(state.list));
      }
    },
    deleteUser: (state, action) => {
      state.list = state.list.filter(u => u.id !== action.payload);
      localStorage.setItem('users_database', JSON.stringify(state.list));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersFromSupabase.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersFromSupabase.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.list = action.payload;
          localStorage.setItem('users_database', JSON.stringify(state.list));
        }
      })
      .addCase(fetchUsersFromSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addUserToSupabase.fulfilled, (state, action) => {
        const exists = state.list.some(u => u.id === action.payload.id);
        if (!exists) {
          state.list.push(action.payload);
          localStorage.setItem('users_database', JSON.stringify(state.list));
        }
      })
      .addCase(updateUserInSupabase.fulfilled, (state, action) => {
        const idx = state.list.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
          localStorage.setItem('users_database', JSON.stringify(state.list));
        }
      })
      .addCase(deleteUserFromSupabase.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u.id !== action.payload);
        localStorage.setItem('users_database', JSON.stringify(state.list));
      });
  }
});

export const { setUsersList, addUser, editUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;

