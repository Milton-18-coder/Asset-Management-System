import { createSlice } from '@reduxjs/toolkit';

export const DEMO_USERS = {
  superadmin: {
    username: 'superadmin',
    name: 'Dr. Rajesh Kumar',
    role: 'superadmin',
    department: 'Administration',
    avatar: 'RK',
    email: 'rajesh.kumar@nec.edu.in',
    phone: '+91 98401 23456',
    office: 'ADM-101 (Admin Block)',
    employeeId: 'EMP-ADM-001',
    designation: 'Campus Director & Chief Estate Officer',
    joinDate: '12 Aug 2018',
    bio: 'Director of Academic Infrastructure & Campus Asset Allocation.',
  },
  deptadmin: {
    username: 'deptadmin',
    name: 'Prof. Anitha Sharma',
    role: 'deptadmin',
    department: 'Computer Science',
    avatar: 'AS',
    email: 'anitha.sharma@nec.edu.in',
    phone: '+91 98402 34567',
    office: 'CS-101 (Engineering Block)',
    employeeId: 'EMP-CSE-012',
    designation: 'Head of Department - Computer Science',
    joinDate: '05 Jul 2019',
    bio: 'Oversees computing infrastructure and department asset requisitions.',
  },
  cs_admin: {
    username: 'cs_admin',
    name: 'Prof. Suresh Babu',
    role: 'deptadmin',
    department: 'Computer Science',
    avatar: 'SB',
    email: 'suresh.babu@nec.edu.in',
    phone: '+91 98403 45678',
    office: 'CS-Lab1 (Engineering Block)',
    employeeId: 'EMP-CSE-028',
    designation: 'Senior Assistant Professor & Lab Coordinator',
    joinDate: '14 Jan 2021',
    bio: 'Coordinator for CSE Computing Labs, Servers, and Workstations.',
  },
  ece_admin: {
    username: 'ece_admin',
    name: 'Prof. Ramesh Nair',
    role: 'deptadmin',
    department: 'ECE',
    avatar: 'RN',
    email: 'ramesh.nair@nec.edu.in',
    phone: '+91 98404 56789',
    office: 'ECE-Lab2 (Engineering Block)',
    employeeId: 'EMP-ECE-015',
    designation: 'Associate Professor & ECE Lab In-Charge',
    joinDate: '18 Nov 2020',
    bio: 'Supervises VLSI, Embedded Systems, and Signal Processing test benches.',
  },
  me_admin: {
    username: 'me_admin',
    name: 'Prof. Kavitha Raj',
    role: 'deptadmin',
    department: 'Mechanical',
    avatar: 'KR',
    email: 'kavitha.raj@nec.edu.in',
    phone: '+91 98405 67890',
    office: 'ME-101 (Engineering Block)',
    employeeId: 'EMP-MEC-009',
    designation: 'Associate Professor, CAD/CAM & Machine Tools',
    joinDate: '03 Sep 2021',
    bio: 'Manages mechanical prototyping lab machinery, furniture, and workshop equipment.',
  },
  phy_admin: {
    username: 'phy_admin',
    name: 'Prof. Dinesh Kumar',
    role: 'deptadmin',
    department: 'Physics',
    avatar: 'DK',
    email: 'dinesh.kumar@nec.edu.in',
    phone: '+91 98406 78901',
    office: 'PH-201 (Science Block)',
    employeeId: 'EMP-PHY-005',
    designation: 'Assistant Professor & Optics Lab Supervisor',
    joinDate: '22 Feb 2022',
    bio: 'Manages physics optics benches, smart classrooms, and experimental instruments.',
  },
  auditor: {
    username: 'auditor',
    name: 'Mr. Ravi Shankar',
    role: 'deptadmin',
    department: 'Administration',
    avatar: 'RS',
    email: 'ravi.shankar@nec.edu.in',
    phone: '+91 98407 89012',
    office: 'ADM-Audits (Admin Block)',
    employeeId: 'EMP-QA-003',
    designation: 'Senior Asset & Inventory Quality Auditor',
    joinDate: '10 Oct 2017',
    bio: 'Performs periodic physical audits and condition verifications across campus blocks.',
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { 
    currentUser: null, 
    isAuthenticated: false 
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      if (action.payload?.remember) {
        localStorage.setItem('asset_auth_user', JSON.stringify(action.payload));
      } else {
        sessionStorage.setItem('asset_auth_user', JSON.stringify(action.payload));
        localStorage.removeItem('asset_auth_user');
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('asset_auth_user');
      sessionStorage.removeItem('asset_auth_user');
    },
    updateProfileSuccess: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        if (localStorage.getItem('asset_auth_user')) {
          localStorage.setItem('asset_auth_user', JSON.stringify(state.currentUser));
        }
        if (sessionStorage.getItem('asset_auth_user')) {
          sessionStorage.setItem('asset_auth_user', JSON.stringify(state.currentUser));
        }
      }
    }
  },
});

export const { loginSuccess, logout, updateProfileSuccess } = authSlice.actions;
export default authSlice.reducer;
