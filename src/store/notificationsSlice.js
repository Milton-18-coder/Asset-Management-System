import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabaseClient';

export const mapDbToNotification = (row) => ({
  id: `NOTIF-${row.id}`,
  db_id: row.id,
  title: row.title,
  message: row.message,
  type: row.type || 'info',
  department: row.department || 'All',
  read: Boolean(row.is_read),
  timestamp: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
  link: row.type === 'transfer' ? '/transfers' : row.type === 'inspection' ? '/inspections' : '/notifications',
});

// Async Thunk: Fetch Notifications from Supabase
export const fetchNotificationsFromSupabase = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbToNotification);
    } catch (err) {
      console.warn('Supabase notifications fetch failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Add Notification to Supabase
export const addNotificationToSupabase = createAsyncThunk(
  'notifications/addNotification',
  async (notif, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          title: notif.title,
          message: notif.message,
          type: notif.type || 'info',
          department: notif.department || 'All',
          is_read: false,
        }])
        .select();

      if (error) throw error;
      return mapDbToNotification(data[0]);
    } catch (err) {
      console.error('Failed to add notification to Supabase:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Mark Notification Read in Supabase
export const markNotificationReadInSupabase = createAsyncThunk(
  'notifications/markRead',
  async (notifId, { rejectWithValue }) => {
    try {
      const dbId = String(notifId).replace('NOTIF-', '');
      if (Number(dbId)) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', Number(dbId));
      }
      return notifId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsFromSupabase.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.list = action.payload;
          localStorage.setItem('notifications_list', JSON.stringify(state.list));
        }
      })
      .addCase(addNotificationToSupabase.fulfilled, (state, action) => {
        const exists = state.list.some(n => n.id === action.payload.id);
        if (!exists) {
          state.list.unshift(action.payload);
          localStorage.setItem('notifications_list', JSON.stringify(state.list));
        }
      })
      .addCase(markNotificationReadInSupabase.fulfilled, (state, action) => {
        const notif = state.list.find((n) => n.id === action.payload);
        if (notif) {
          notif.read = true;
          localStorage.setItem('notifications_list', JSON.stringify(state.list));
        }
      });
  }
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
