import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabaseClient';

export const mapDbToAsset = (row) => ({
  id: row.code || `AST-${String(row.id).padStart(3, '0')}`,
  db_id: row.id,
  name: row.name || '',
  category: row.category || 'General',
  building: row.building || 'Main Block',
  department: row.department || 'Administration',
  room: row.room || 'Unassigned',
  condition: row.condition || 'Good',
  status: row.status || 'Available',
  purchaseDate: row.purchase_date || '',
  cost: Number(row.cost || 0),
  supplier: row.supplier || '',
  warranty: row.warranty || '',
  quantity: Number(row.quantity || 1),
  description: row.description || '',
});

export const mapAssetToDb = (item) => ({
  code: item.id || item.code,
  name: item.name,
  category: item.category,
  building: item.building,
  department: item.department,
  room: item.room,
  condition: item.condition,
  status: item.status,
  purchase_date: item.purchaseDate || null,
  cost: item.cost ? Number(item.cost) : null,
  supplier: item.supplier || null,
  warranty: item.warranty || null,
  quantity: item.quantity ? Number(item.quantity) : 1,
  description: item.description || null,
});

// Async Thunk: Fetch from Supabase
export const fetchAssetsFromSupabase = createAsyncThunk(
  'furniture/fetchAssets',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToAsset);
    } catch (err) {
      console.warn('Supabase fetch failed, using local/cached state:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Add Asset to Supabase
export const addAssetToSupabase = createAsyncThunk(
  'furniture/addAsset',
  async (assetData, { rejectWithValue }) => {
    try {
      const dbPayload = mapAssetToDb(assetData);
      const { data, error } = await supabase
        .from('assets')
        .insert([dbPayload])
        .select();

      if (error) throw error;
      return mapDbToAsset(data[0]);
    } catch (err) {
      console.error('Supabase add asset failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Update Asset in Supabase
export const updateAssetInSupabase = createAsyncThunk(
  'furniture/updateAsset',
  async (assetData, { rejectWithValue }) => {
    try {
      const dbPayload = mapAssetToDb(assetData);
      const { data, error } = await supabase
        .from('assets')
        .update(dbPayload)
        .eq('code', assetData.id)
        .select();

      if (error) throw error;
      return mapDbToAsset(data[0] || assetData);
    } catch (err) {
      console.error('Supabase update asset failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Delete Asset from Supabase
export const deleteAssetFromSupabase = createAsyncThunk(
  'furniture/deleteAsset',
  async (assetId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('code', assetId);

      if (error) throw error;
      return assetId;
    } catch (err) {
      console.error('Supabase delete asset failed:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

const getInitialFurniture = () => {
  const saved = localStorage.getItem('furniture_list');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return [];
};

const furnitureSlice = createSlice({
  name: 'furniture',
  initialState: {
    list: getInitialFurniture(),
    loading: false,
    error: null,
  },
  reducers: {
    setFurnitureList: (state, action) => {
      state.list = action.payload;
      localStorage.setItem('furniture_list', JSON.stringify(state.list));
    },
    addFurniture: (state, action) => {
      const exists = state.list.some(f => f.id === action.payload.id);
      if (!exists) {
        state.list.unshift(action.payload);
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      }
    },
    editFurniture: (state, action) => {
      const idx = state.list.findIndex(f => f.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      }
    },
    deleteFurniture: (state, action) => {
      state.list = state.list.filter(f => f.id !== action.payload);
      localStorage.setItem('furniture_list', JSON.stringify(state.list));
    },
    updateFurnitureLocation: (state, action) => {
      const item = state.list.find(f => f.id === action.payload.id);
      if (item) {
        item.room = action.payload.room;
        item.building = action.payload.building;
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      }
    },
    updateFurnitureCondition: (state, action) => {
      const item = state.list.find(f => f.id === action.payload.id);
      if (item) {
        item.condition = action.payload.condition;
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetsFromSupabase.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssetsFromSupabase.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.list = action.payload;
          localStorage.setItem('furniture_list', JSON.stringify(state.list));
        }
      })
      .addCase(fetchAssetsFromSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAssetToSupabase.fulfilled, (state, action) => {
        const exists = state.list.some(f => f.id === action.payload.id);
        if (!exists) {
          state.list.unshift(action.payload);
        } else {
          const idx = state.list.findIndex(f => f.id === action.payload.id);
          state.list[idx] = action.payload;
        }
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      })
      .addCase(updateAssetInSupabase.fulfilled, (state, action) => {
        const idx = state.list.findIndex(f => f.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
          localStorage.setItem('furniture_list', JSON.stringify(state.list));
        }
      })
      .addCase(deleteAssetFromSupabase.fulfilled, (state, action) => {
        state.list = state.list.filter(f => f.id !== action.payload);
        localStorage.setItem('furniture_list', JSON.stringify(state.list));
      });
  },
});

export const {
  setFurnitureList,
  addFurniture,
  editFurniture,
  deleteFurniture,
  updateFurnitureLocation,
  updateFurnitureCondition,
} = furnitureSlice.actions;

export default furnitureSlice.reducer;
