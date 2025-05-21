import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import cycleRoutes from './routes/cycleRoutes';
import symptomRoutes from './routes/symptomRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Welcome to HaidTracker API');
});

// Auth (login & register)
app.use('/auth', authRoutes);

// User management (admin only)
app.use('/users', userRoutes);

// Cycle tracking
app.use('/cycles', cycleRoutes);

// Symptom tracking
app.use('/symptoms', symptomRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
