import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import { seedInitialDataIfEmpty } from './seedData.js';
import {
  initialAssets,
  initialUsers,
  initialTransfers,
  initialInspections,
  initialNotifications,
  initialDepartments,
  initialBuildings,
  initialRooms,
  initialMaintenanceLogs,
  initialDisposals,
  initialVendors,
  initialAuditLogs,
  initialCategories
} from './initialData.js';

import assetsRouter from './routes/assets.js';
import transfersRouter from './routes/transfers.js';
import inspectionsRouter from './routes/inspections.js';
import usersRouter from './routes/users.js';
import notificationsRouter from './routes/notifications.js';
import departmentsRouter from './routes/departments.js';
import buildingsRouter from './routes/buildings.js';
import roomsRouter from './routes/rooms.js';
import maintenanceRouter from './routes/maintenance.js';
import disposalsRouter from './routes/disposals.js';
import vendorsRouter from './routes/vendors.js';
import auditLogsRouter from './routes/auditLogs.js';
import categoriesRouter from './routes/categories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/assets', assetsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/buildings', buildingsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/disposals', disposalsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/categories', categoriesRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MySQL', time: new Date().toISOString() });
});

// Start Server
async function startServer() {
  try {
    await initDatabase();
    await seedInitialDataIfEmpty(
      initialAssets,
      initialUsers,
      initialTransfers,
      initialInspections,
      initialNotifications,
      initialDepartments,
      initialBuildings,
      initialRooms,
      initialMaintenanceLogs,
      initialDisposals,
      initialVendors,
      initialAuditLogs,
      initialCategories
    );
    
    app.listen(PORT, () => {
      console.log(`🚀 Asset Management API Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
