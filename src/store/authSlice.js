import { createSlice } from '@reduxjs/toolkit';
import { mapLegacyDepartment } from '../constants/departments.js';

export const DEMO_USERS = {
  superadmin: {
    username: 'superadmin',
    name: 'Dr. Rajesh Kumar',
    role: 'superadmin',
    department: 'Admin Block',
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
  civil_admin: {
    username: 'civil_admin',
    name: 'Prof. Aruna Devi',
    role: 'deptadmin',
    department: 'Civil',
    avatar: 'AD',
    email: 'aruna.devi@nec.edu.in',
    phone: '+91 98408 90123',
    office: 'CV-101 (IT Block)',
    employeeId: 'EMP-CIV-007',
    designation: 'Associate Professor & Civil Lab In-Charge',
    joinDate: '15 Mar 2020',
    bio: 'Oversees structural testing equipment, survey stations, and drafting studios.',
  },
  it_admin: {
    username: 'it_admin',
    name: 'Dr. M. Venkatesh',
    role: 'deptadmin',
    department: 'IT',
    avatar: 'MV',
    email: 'venkatesh.m@nec.edu.in',
    phone: '+91 98409 11223',
    office: 'IT-101 (IT Block)',
    employeeId: 'EMP-IT-003',
    designation: 'Head of Department - IT',
    joinDate: '10 Feb 2019',
    bio: 'Supervises network security, web labs, and cloud development infrastructure.',
  },
  aids_admin: {
    username: 'aids_admin',
    name: 'Dr. Nalini Patel',
    role: 'deptadmin',
    department: 'AIDS',
    avatar: 'NP',
    email: 'nalini.patel@nec.edu.in',
    phone: '+91 98410 22334',
    office: 'AIDS-101 (Engineering Block)',
    employeeId: 'EMP-AID-001',
    designation: 'Head of Department - AIDS',
    joinDate: '18 Jun 2021',
    bio: 'Oversees GPU computing clusters and deep learning analytics labs.',
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
  eee_admin: {
    username: 'eee_admin',
    name: 'Dr. R. Vijay Anand',
    role: 'deptadmin',
    department: 'EEE',
    avatar: 'VA',
    email: 'vijayanand.r@nec.edu.in',
    phone: '+91 98411 33445',
    office: 'EEE-101 (Engineering Block)',
    employeeId: 'EMP-EEE-004',
    designation: 'Head of Department - EEE',
    joinDate: '08 Aug 2019',
    bio: 'Manages electrical machines labs, high voltage rigs, and power analyzers.',
  },
  sh_admin: {
    username: 'sh_admin',
    name: 'Prof. Dinesh Kumar',
    role: 'deptadmin',
    department: 'Science & Humanities',
    avatar: 'DK',
    email: 'dinesh.kumar@nec.edu.in',
    phone: '+91 98406 78901',
    office: 'SH-PhysicsLab (Science Block)',
    employeeId: 'EMP-SNH-005',
    designation: 'Assistant Professor & Lab Supervisor',
    joinDate: '22 Feb 2022',
    bio: 'Manages physics optics benches, chemistry labs, and smart classrooms.',
  },
  admin_officer: {
    username: 'admin_officer',
    name: 'Ms. Priya Mehta',
    role: 'deptadmin',
    department: 'Admin Block',
    avatar: 'PM',
    email: 'priya.mehta@nec.edu.in',
    phone: '+91 98409 01234',
    office: 'ADM-101 (Admin Block)',
    employeeId: 'EMP-ADM-002',
    designation: 'Chief Administrative Officer',
    joinDate: '14 May 2019',
    bio: 'Manages central administrative facilities, conference halls, and institutional records.',
  },
  auditor: {
    username: 'auditor',
    name: 'Mr. Ravi Shankar',
    role: 'auditor',
    department: 'Admin Block',
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

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('asset_auth_user') || sessionStorage.getItem('asset_auth_user');
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (user && user.department) {
      user.department = mapLegacyDepartment(user.department);
    }
    return user;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { 
    currentUser: getStoredUser(), 
    isAuthenticated: !!getStoredUser() 
  },
  reducers: {
    loginSuccess: (state, action) => {
      const payload = {
        ...action.payload,
        department: mapLegacyDepartment(action.payload?.department),
      };
      state.currentUser = payload;
      state.isAuthenticated = true;
      if (action.payload?.remember) {
        localStorage.setItem('asset_auth_user', JSON.stringify(payload));
      } else {
        sessionStorage.setItem('asset_auth_user', JSON.stringify(payload));
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
        const payload = {
          ...action.payload,
          department: action.payload?.department ? mapLegacyDepartment(action.payload.department) : state.currentUser.department,
        };
        state.currentUser = { ...state.currentUser, ...payload };
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
