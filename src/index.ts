import express from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import cycleRoutes from './routes/cycleRoutes';
import symptomRoutes from './routes/symptomRoutes';  // tambahkan import ini

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to HaidTracker API');
});

// Routes utama
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/cycles', cycleRoutes);
app.use('/symptoms', symptomRoutes);  // tambahkan ini supaya route symptom dikenali

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
