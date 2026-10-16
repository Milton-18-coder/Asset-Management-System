import { createSlice } from '@reduxjs/toolkit';
import { mapLegacyDepartment } from '../constants/departments.js';

const getInitialUsers = () => {
  const initial = [
    { id: 'U01', name: 'Dr. Rajesh Kumar', username: 'superadmin', role: 'Super Admin', department: 'Admin Block', status: 'Active', email: 'rajesh.kumar@nec.edu.in', phone: '+91 98401 23456', office: 'ADM-101' },
    { id: 'U02', name: 'Prof. Anitha Sharma', username: 'deptadmin', role: 'Dept Admin', department: 'Computer Science', status: 'Active', email: 'anitha.sharma@nec.edu.in', phone: '+91 98402 34567', office: 'CS-101' },
    { id: 'U03', name: 'Prof. Suresh Babu', username: 'cs_admin', role: 'Dept Admin', department: 'Computer Science', status: 'Active', email: 'suresh.babu@nec.edu.in', phone: '+91 98403 45678', office: 'CS-Lab1' },
    { id: 'U04', name: 'Prof. Kavitha Raj', username: 'me_admin', role: 'Dept Admin', department: 'Mechanical', status: 'Active', email: 'kavitha.raj@nec.edu.in', phone: '+91 98405 67890', office: 'ME-101' },
    { id: 'U05', name: 'Prof. Aruna Devi', username: 'civil_admin', role: 'Dept Admin', department: 'Civil', status: 'Active', email: 'aruna.devi@nec.edu.in', phone: '+91 98408 90123', office: 'CV-101' },
    { id: 'U06', name: 'Dr. M. Venkatesh', username: 'it_admin', role: 'Dept Admin', department: 'IT', status: 'Active', email: 'venkatesh.m@nec.edu.in', phone: '+91 98409 11223', office: 'IT-101' },
    { id: 'U07', name: 'Dr. Nalini Patel', username: 'aids_admin', role: 'Dept Admin', department: 'AIDS', status: 'Active', email: 'nalini.patel@nec.edu.in', phone: '+91 98410 22334', office: 'AIDS-101' },
    { id: 'U08', name: 'Prof. Ramesh Nair', username: 'ece_admin', role: 'Dept Admin', department: 'ECE', status: 'Active', email: 'ramesh.nair@nec.edu.in', phone: '+91 98404 56789', office: 'ECE-Lab2' },
    { id: 'U09', name: 'Dr. R. Vijay Anand', username: 'eee_admin', role: 'Dept Admin', department: 'EEE', status: 'Active', email: 'vijayanand.r@nec.edu.in', phone: '+91 98411 33445', office: 'EEE-101' },
    { id: 'U10', name: 'Prof. Dinesh Kumar', username: 'sh_admin', role: 'Dept Admin', department: 'Science & Humanities', status: 'Active', email: 'dinesh.kumar@nec.edu.in', phone: '+91 98406 78901', office: 'SH-PhysicsLab' },
    { id: 'U11', name: 'Ms. Priya Mehta', username: 'admin_officer', role: 'Dept Admin', department: 'Admin Block', status: 'Active', email: 'priya.mehta@nec.edu.in', phone: '+91 98409 01234', office: 'ADM-101' },
    { id: 'U12', name: 'Mr. Ravi Shankar', username: 'auditor', role: 'Inspector / Auditor', department: 'Admin Block', status: 'Active', email: 'ravi.shankar@nec.edu.in', phone: '+91 98407 89012', office: 'ADM-Audits' },
    { id: 'U13', name: 'Dr. Lalitha Devi', username: 'chem_faculty', role: 'Faculty', department: 'Science & Humanities', status: 'Active', email: 'lalitha.devi@nec.edu.in', phone: '+91 98412 44556', office: 'SH-ChemistryLab' }
  ];

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return initial;
  }

  const saved = localStorage.getItem('users_database_v3');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 8) {
        return parsed.map(u => ({
          ...u,
          department: mapLegacyDepartment(u.department),
        }));
      }
    } catch {
      // ignore
    }
  }

  localStorage.setItem('users_database_v3', JSON.stringify(initial));
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
      state.list = (action.payload || []).map(u => ({
        ...u,
        department: mapLegacyDepartment(u.department),
      }));
      localStorage.setItem('users_database_v3', JSON.stringify(state.list));
    },
    addUser: (state, action) => {
      const payload = {
        ...action.payload,
        department: mapLegacyDepartment(action.payload?.department),
      };
      const exists = state.list.some(u => u.id === payload.id);
      if (!exists) {
        state.list.push(payload);
        localStorage.setItem('users_database_v3', JSON.stringify(state.list));
      }
    },
    editUser: (state, action) => {
      const idx = state.list.findIndex(u => u.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = {
          ...state.list[idx],
          ...action.payload,
          department: mapLegacyDepartment(action.payload?.department || state.list[idx].department),
        };
        localStorage.setItem('users_database_v3', JSON.stringify(state.list));
      }
    },
    deleteUser: (state, action) => {
      state.list = state.list.filter(u => u.id !== action.payload);
      localStorage.setItem('users_database_v3', JSON.stringify(state.list));
    }
  },
});

export const { setUsersList, addUser, editUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
