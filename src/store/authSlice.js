import { createSlice } from '@reduxjs/toolkit';

export const DEMO_USERS = {
  superadmin: {
    username: 'superadmin',
    name: 'Dr. Rajesh Kumar',
    role: 'superadmin',
    department: 'Administration',
    avatar: 'RK',
    email: 'rajesh.kumar@nec.edu',
  },
  deptadmin: {
    username: 'deptadmin',
    name: 'Prof. Anitha Sharma',
    role: 'deptadmin',
    department: 'Computer Science',
    avatar: 'AS',
    email: 'anitha.sharma@nec.edu',
  },
  cs_admin: {
    username: 'cs_admin',
    name: 'Prof. Suresh Babu',
    role: 'deptadmin',
    department: 'Computer Science',
    avatar: 'SB',
    email: 'suresh.babu@nec.edu',
  },
};

const getInitialState = () => {
  const saved = localStorage.getItem('asset_auth_user');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { currentUser: parsed, isAuthenticated: true };
    } catch {
      // ignore
    }
  }
  return { currentUser: null, isAuthenticated: false };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('asset_auth_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('asset_auth_user');
    },
    updateProfileSuccess: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        localStorage.setItem('asset_auth_user', JSON.stringify(state.currentUser));
      }
    }
  },
});

export const { loginSuccess, logout, updateProfileSuccess } = authSlice.actions;
export default authSlice.reducer;
