import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import { seedInitialDataIfEmpty } from './seedData.js';
import { initialAssets, initialUsers, initialTransfers, initialInspections, initialNotifications } from './initialData.js';

import assetsRouter from './routes/assets.js';
import transfersRouter from './routes/transfers.js';
import inspectionsRouter from './routes/inspections.js';
import usersRouter from './routes/users.js';
import notificationsRouter from './routes/notifications.js';

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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MySQL', time: new Date().toISOString() });
});

// Start Server
async function startServer() {
  try {
    await initDatabase();
    await seedInitialDataIfEmpty(initialAssets, initialUsers, initialTransfers, initialInspections, initialNotifications);
    
    app.listen(PORT, () => {
      console.log(`🚀 Asset Management API Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
