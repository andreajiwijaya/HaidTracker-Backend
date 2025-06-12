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
exports.getCycleStats = exports.searchCycles = exports.deleteCycle = exports.updateCycle = exports.createCycle = exports.getCycleById = exports.getCycles = void 0;
const cycleService = __importStar(require("../services/cycleService"));
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
// Helper untuk validasi tanggal (dapat dipindah ke utils/validation.ts jika sering dipakai)
const isValidDate = (dateStr) => typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
const getCycles = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        const cycles = await cycleService.getAllCycles(userId, role);
        res.json(cycles);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil daftar siklus.' });
        }
    }
};
exports.getCycles = getCycles;
const getCycleById = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        const cycleId = Number(req.params.id);
        // Validasi dasar ID bisa tetap di controller
        if (isNaN(cycleId)) {
            res.status(400).json({ error: 'ID siklus tidak valid.' });
            return;
        }
        // Perbaikan: Memanggil service yang sudah melempar AppError
        const cycle = await cycleService.getCycle(cycleId); // Service akan menangani not found
        if (role !== 'admin' && cycle.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke siklus ini.' });
            return;
        }
        res.json(cycle);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil detail siklus.' });
        }
    }
};
exports.getCycleById = getCycleById;
const createCycle = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        const { startDate, endDate, note, userId: targetUserId } = req.body;
        // Perbaikan: Validasi dipindahkan ke service, controller hanya memanggil dan menangkap error
        const cycle = await cycleService.createCycleEntry(userId, role, {
            startDate,
            endDate,
            note,
            targetUserId,
        });
        res.status(201).json(cycle);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal membuat siklus baru.' });
        }
    }
};
exports.createCycle = createCycle;
const updateCycle = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        const cycleId = Number(req.params.id);
        if (isNaN(cycleId)) {
            res.status(400).json({ error: 'ID siklus tidak valid.' });
            return;
        }
        // Perbaikan: Ambil siklus dulu untuk otorisasi
        const existing = await cycleService.getCycle(cycleId); // Ini akan melempar AppError jika tidak ditemukan
        if (role !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk memperbarui siklus ini.' });
            return;
        }
        const { startDate, endDate, note } = req.body;
        const updated = await cycleService.updateCycleEntry(cycleId, { startDate, endDate, note });
        res.json(updated);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal memperbarui siklus.' });
        }
    }
};
exports.updateCycle = updateCycle;
const deleteCycle = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        const cycleId = Number(req.params.id);
        if (isNaN(cycleId)) {
            res.status(400).json({ error: 'ID siklus tidak valid.' });
            return;
        }
        // Perbaikan: Ambil siklus dulu untuk otorisasi
        const existing = await cycleService.getCycle(cycleId); // Ini akan melempar AppError jika tidak ditemukan
        if (role !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk menghapus siklus ini.' });
            return;
        }
        await cycleService.deleteCycleEntry(cycleId);
        res.status(204).send(); // 204 No Content for successful deletion
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal menghapus siklus.' });
        }
    }
};
exports.deleteCycle = deleteCycle;
const searchCycles = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
        const { noteKeyword, startDate } = req.query;
        const cycles = await cycleService.searchUserCycles(userId, role, {
            noteKeyword: noteKeyword,
            startDate: startDate,
        });
        res.json(cycles);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mencari siklus.' });
        }
    }
};
exports.searchCycles = searchCycles;
const getCycleStats = async (req, res) => {
    console.log('DEBUG: cycleController/getCycleStats - User ID:', req.userId, 'Role:', req.userRole);
    try {
        const role = req.userRole;
        // Middleware authorizeRole sudah mengurus ini, tapi validasi di controller/service juga bisa
        if (role !== 'admin') {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke statistik.' });
            return;
        }
        const stats = await cycleService.getCycleStatistics();
        res.json(stats);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil statistik siklus.' });
        }
    }
};
exports.getCycleStats = getCycleStats;
