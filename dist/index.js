"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cycleRoutes_1 = __importDefault(require("./routes/cycleRoutes"));
const symptomRoutes_1 = __importDefault(require("./routes/symptomRoutes"));
const reminderRoutes_1 = __importDefault(require("./routes/reminderRoutes"));
const analyticRoutes_1 = __importDefault(require("./routes/analyticRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Root route
app.get('/', (req, res) => {
    res.send('🚀 Welcome to HaidTracker API');
});
// Main API routes with /api prefix
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/cycles', cycleRoutes_1.default);
app.use('/api/symptoms', symptomRoutes_1.default);
app.use('/api/reminders', reminderRoutes_1.default);
app.use('/api/analytics', analyticRoutes_1.default);
// 404 fallback for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Server listen
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
