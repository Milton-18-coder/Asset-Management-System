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
  return [];
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { 
    list: getInitialNotifications(),
    loading: false,
  },
  reducers: {
    setNotificationsList: (state, action) => {
      state.list = action.payload;
      localStorage.setItem('notifications_list', JSON.stringify(state.list));
    },
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
  setNotificationsList,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
