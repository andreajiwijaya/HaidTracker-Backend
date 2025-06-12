"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticById = exports.deleteAnalytic = exports.updateAnalytic = exports.createAnalytic = exports.getUserAnalytics = exports.getAllAnalyticsForAdmin = void 0;
const analyticService = __importStar(require("../services/analyticService"));
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
// Helper untuk validasi tanggal (bisa juga di utils/validation.ts)
const isValidISODateString = (dateStr) => {
    return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};
// 1. Admin: Get all analytics
const getAllAnalyticsForAdmin = async (req, res) => {
    try {
        // Middleware authorizeRole sudah mengurus otorisasi admin
        const analytics = await analyticService.getAllAnalytics();
        res.json(analytics);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil semua analitik untuk admin.' });
        }
    }
};
exports.getAllAnalyticsForAdmin = getAllAnalyticsForAdmin;
// 2. User: Get own analytics
const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.userId;
        const analytics = await analyticService.getAnalyticsByUserId(userId);
        res.json(analytics);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil analitik Anda.' });
        }
    }
};
exports.getUserAnalytics = getUserAnalytics;
// 3. Create analytic (user)
const createAnalytic = async (req, res) => {
    const userId = req.userId;
    const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;
    try {
        // Validasi dasar tetap di controller
        if (!isValidISODateString(periodStart) || !isValidISODateString(periodEnd)) {
            res.status(400).json({ error: 'Tanggal mulai dan akhir periode wajib diisi dan harus valid.' });
            return;
        }
        const analytic = await analyticService.createAnalyticForUser(userId, {
            periodStart,
            periodEnd,
            averageCycle,
            symptomSummary,
        });
        res.status(201).json(analytic);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal membuat analitik.' });
        }
    }
};
exports.createAnalytic = createAnalytic;
// 4. Update analytic
const updateAnalytic = async (req, res) => {
    try {
        const analyticId = Number(req.params.id);
        if (isNaN(analyticId)) {
            res.status(400).json({ error: 'ID analitik tidak valid.' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;
        // Perbaikan: Ambil analitik dulu untuk otorisasi
        const existingAnalytic = await analyticService.getAnalyticById(analyticId); // Ini akan melempar AppError jika tidak ditemukan
        if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk memperbarui analitik ini.' });
            return;
        }
        const dataToUpdate = {};
        if (periodStart !== undefined) {
            if (!isValidISODateString(periodStart)) {
                res.status(400).json({ error: 'Tanggal mulai periode harus valid jika disediakan.' });
                return;
            }
            dataToUpdate.periodStart = periodStart; // Dikirim sebagai string, konversi di service
        }
        if (periodEnd !== undefined) {
            if (!isValidISODateString(periodEnd)) {
                res.status(400).json({ error: 'Tanggal akhir periode harus valid jika disediakan.' });
                return;
            }
            dataToUpdate.periodEnd = periodEnd; // Dikirim sebagai string, konversi di service
        }
        if (averageCycle !== undefined) {
            dataToUpdate.averageCycle = averageCycle;
        }
        if (symptomSummary !== undefined) {
            dataToUpdate.symptomSummary = symptomSummary;
        }
        const updatedAnalytic = await analyticService.updateAnalyticById(analyticId, dataToUpdate);
        res.json(updatedAnalytic);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal memperbarui analitik.' });
        }
    }
};
exports.updateAnalytic = updateAnalytic;
// 5. Delete analytic
const deleteAnalytic = async (req, res) => {
    try {
        const analyticId = Number(req.params.id);
        if (isNaN(analyticId)) {
            res.status(400).json({ error: 'ID analitik tidak valid.' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const existingAnalytic = await analyticService.getAnalyticById(analyticId); // Ini akan melempar AppError jika tidak ditemukan
        if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk menghapus analitik ini.' });
            return;
        }
        await analyticService.deleteAnalyticById(analyticId);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal menghapus analitik.' });
        }
    }
};
exports.deleteAnalytic = deleteAnalytic;
// 6. Get analytic by ID
const getAnalyticById = async (req, res) => {
    try {
        const analyticId = Number(req.params.id);
        if (isNaN(analyticId)) {
            res.status(400).json({ error: 'ID analitik tidak valid.' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const analytic = await analyticService.getAnalyticById(analyticId); // Ini akan melempar AppError jika tidak ditemukan
        if (userRole !== 'admin' && analytic.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke analitik ini.' });
            return;
        }
        res.json(analytic);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil detail analitik.' });
        }
    }
};
exports.getAnalyticById = getAnalyticById;
