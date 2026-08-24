import { createSlice } from '@reduxjs/toolkit';

const getInitialUsers = () => {
  const saved = localStorage.getItem('users_database');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const initial = [
    { id: 'U01', name: 'Dr. Rajesh Kumar', username: 'superadmin', role: 'Super Admin', department: 'Administration', status: 'Active', email: 'rajesh.kumar@nec.edu.in' },
    { id: 'U02', name: 'Prof. Anitha Sharma', username: 'deptadmin', role: 'Dept Admin', department: 'Computer Science', status: 'Active', email: 'anitha.sharma@nec.edu.in' },
    { id: 'U03', name: 'Prof. Suresh Babu', username: 'cs_admin', role: 'Dept Admin', department: 'Computer Science', status: 'Active', email: 'suresh.babu@nec.edu.in' },
    { id: 'U04', name: 'Prof. Ramesh Nair', username: 'ece_admin', role: 'Dept Admin', department: 'ECE', status: 'Active', email: 'ramesh.nair@nec.edu.in' },
    { id: 'U05', name: 'Prof. Kavitha Raj', username: 'me_admin', role: 'Dept Admin', department: 'Mechanical', status: 'Inactive', email: 'kavitha.raj@nec.edu.in' },
    { id: 'U06', name: 'Prof. Dinesh Kumar', username: 'phy_admin', role: 'Dept Admin', department: 'Physics', status: 'Active', email: 'dinesh.kumar@nec.edu.in' }
  ];
  localStorage.setItem('users_database', JSON.stringify(initial));
  return initial;
};

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: getInitialUsers() },
  reducers: {
    addUser: (state, action) => {
      state.list.push(action.payload);
      localStorage.setItem('users_database', JSON.stringify(state.list));
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
  }
});

export const { addUser, editUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
