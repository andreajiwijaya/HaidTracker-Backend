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
exports.getSymptomsByUser = exports.deleteSymptom = exports.updateSymptom = exports.createSymptom = exports.getSymptomById = exports.getSymptoms = void 0;
const symptomService = __importStar(require("../services/symptomService"));
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
const getSymptoms = async (req, res) => {
    try {
        const userId = req.userId;
        const symptoms = await symptomService.getSymptoms(userId);
        res.json(symptoms);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil daftar gejala.' });
        }
    }
};
exports.getSymptoms = getSymptoms;
const getSymptomById = async (req, res) => {
    try {
        const symptomId = Number(req.params.id);
        if (isNaN(symptomId)) {
            res.status(400).json({ error: 'ID gejala tidak valid.' });
            return;
        }
        const { userId, userRole } = req; // Gunakan langsung dari req
        const symptom = await symptomService.getSymptomById(symptomId); // Service akan melempar error jika tidak ditemukan
        if (userRole !== 'admin' && symptom.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke gejala ini.' });
            return;
        }
        res.json(symptom);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil detail gejala.' });
        }
    }
};
exports.getSymptomById = getSymptomById;
const createSymptom = async (req, res) => {
    try {
        const userId = req.userId;
        const { date, mood, symptoms } = req.body;
        const newSymptom = await symptomService.createSymptom(userId, date, mood, symptoms);
        res.status(201).json(newSymptom);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal membuat gejala baru.' });
        }
    }
};
exports.createSymptom = createSymptom;
const updateSymptom = async (req, res) => {
    try {
        const symptomId = Number(req.params.id);
        if (isNaN(symptomId)) {
            res.status(400).json({ error: 'ID gejala tidak valid.' });
            return;
        }
        const { userId, userRole } = req;
        const existing = await symptomService.getSymptomById(symptomId); // Ini akan melempar AppError jika tidak ditemukan
        if (userRole !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk memperbarui gejala ini.' });
            return;
        }
        const { date, mood, symptoms } = req.body;
        const updated = await symptomService.updateSymptom(symptomId, date, mood, symptoms);
        res.json(updated);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal memperbarui gejala.' });
        }
    }
};
exports.updateSymptom = updateSymptom;
const deleteSymptom = async (req, res) => {
    try {
        const symptomId = Number(req.params.id);
        if (isNaN(symptomId)) {
            res.status(400).json({ error: 'ID gejala tidak valid.' });
            return;
        }
        const { userId, userRole } = req;
        const existing = await symptomService.getSymptomById(symptomId); // Ini akan melempar AppError jika tidak ditemukan
        if (userRole !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk menghapus gejala ini.' });
            return;
        }
        await symptomService.deleteSymptom(symptomId);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal menghapus gejala.' });
        }
    }
};
exports.deleteSymptom = deleteSymptom;
const getSymptomsByUser = async (req, res) => {
    try {
        const userRole = req.userRole;
        // Middleware authorizeRole sudah mengurus ini, tapi validasi di controller/service juga bisa
        if (userRole !== 'admin') {
            res.status(403).json({ error: 'Terlarang.' });
            return;
        }
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'ID pengguna tidak valid.' });
            return;
        }
        const symptoms = await symptomService.getSymptoms(userId);
        res.json(symptoms);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil gejala berdasarkan pengguna.' });
        }
    }
};
exports.getSymptomsByUser = getSymptomsByUser;
