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

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Welcome to HaidTracker API');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/cycles', cycleRoutes);
app.use('/symptoms', symptomRoutes);
app.use('/reminders', reminderRoutes);
app.use('/analytics', analyticRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
