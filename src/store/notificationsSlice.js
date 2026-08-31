import { createSlice } from '@reduxjs/toolkit';

const getInitialNotifications = () => {
  const saved = localStorage.getItem('notifications_list');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const initial = [
    {
      id: 'NOTIF-001',
      title: 'Pending Transfer Request',
      message: 'Transfer request TRF-003 for Computer Workstation (2 units) is pending approval from CS-Lab1 to ECE-Lab2.',
      type: 'transfer',
      timestamp: '10 mins ago',
      read: false,
      link: '/transfers',
      department: 'Computer Science',
    },
    {
      id: 'NOTIF-002',
      title: 'Asset Inspection Flagged',
      message: 'Oscilloscope (AST-012) was inspected and marked Damaged in ECE-Lab2.',
      type: 'inspection',
      timestamp: '1 hour ago',
      read: false,
      link: '/inspections',
      department: 'ECE',
    },
    {
      id: 'NOTIF-003',
      title: 'Warranty Expiry Alert',
      message: 'LCD Projector (AST-003) warranty has expired. Schedule maintenance check.',
      type: 'warranty',
      timestamp: 'Yesterday',
      read: false,
      link: '/assets/AST-003',
      department: 'Computer Science',
    },
    {
      id: 'NOTIF-004',
      title: 'Transfer Completed',
      message: 'LCD Projector relocation from CS-101 to CS-102 has been finalized.',
      type: 'transfer',
      timestamp: '2 days ago',
      read: true,
      link: '/transfers',
      department: 'Computer Science',
    },
  ];
  localStorage.setItem('notifications_list', JSON.stringify(initial));
  return initial;
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { list: getInitialNotifications() },
  reducers: {
    addNotification: (state, action) => {
      const newNotif = {
        id: 'NOTIF-' + Date.now(),
        timestamp: 'Just now',
        read: false,
        ...action.payload,
      };
      state.list.unshift(newNotif);
      localStorage.setItem('notifications_list', JSON.stringify(state.list));
    },
    markAsRead: (state, action) => {
      const notif = state.list.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
        localStorage.setItem('notifications_list', JSON.stringify(state.list));
      }
    },
    markAllAsRead: (state) => {
      state.list.forEach((n) => {
        n.read = true;
      });
      localStorage.setItem('notifications_list', JSON.stringify(state.list));
    },
    deleteNotification: (state, action) => {
      state.list = state.list.filter((n) => n.id !== action.payload);
      localStorage.setItem('notifications_list', JSON.stringify(state.list));
    },
    clearAllNotifications: (state) => {
      state.list = [];
      localStorage.setItem('notifications_list', JSON.stringify(state.list));
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
