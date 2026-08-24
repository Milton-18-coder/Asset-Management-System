import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import furnitureReducer from './furnitureSlice';
import transfersReducer from './transfersSlice';
import inspectionsReducer from './inspectionsSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    furniture: furnitureReducer,
    transfers: transfersReducer,
    inspections: inspectionsReducer,
    users: usersReducer,
  },
});
