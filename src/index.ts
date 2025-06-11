import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import cycleRoutes from './routes/cycleRoutes';
import symptomRoutes from './routes/symptomRoutes';
import reminderRoutes from './routes/reminderRoutes';
import analyticRoutes from './routes/analyticRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`➡️ Request received: ${req.method} ${req.originalUrl}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Welcome to HaidTracker API');
});

// Main API routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticRoutes);

// 404 fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Server listen
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
