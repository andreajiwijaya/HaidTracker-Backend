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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSymptomsByUser = exports.deleteSymptom = exports.updateSymptom = exports.createSymptom = exports.getSymptomById = exports.getSymptoms = void 0;
const symptomService = __importStar(require("../services/symptomService"));
const getSymptoms = async (req, res) => {
    try {
        const userId = req.userId;
        const symptoms = await symptomService.getSymptoms(userId);
        res.json(symptoms);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch symptoms' });
    }
};
exports.getSymptoms = getSymptoms;
const getSymptomById = async (req, res) => {
    try {
        const symptomId = Number(req.params.id);
        if (isNaN(symptomId)) {
            res.status(400).json({ error: 'Invalid symptom ID' });
            return;
        }
        const { userId, role } = req;
        const symptom = await symptomService.getSymptomById(symptomId);
        if (!symptom) {
            res.status(404).json({ error: 'Symptom not found' });
            return;
        }
        if (role !== 'admin' && symptom.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized to view this symptom' });
            return;
        }
        res.json(symptom);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch symptom' });
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
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.createSymptom = createSymptom;
const updateSymptom = async (req, res) => {
    try {
        const symptomId = Number(req.params.id);
        if (isNaN(symptomId)) {
            res.status(400).json({ error: 'Invalid symptom ID' });
            return;
        }
        const { userId, role } = req;
        const existing = await symptomService.getSymptomById(symptomId);
        if (!existing) {
            res.status(404).json({ error: 'Symptom not found' });
            return;
        }
        if (role !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized to update this symptom' });
            return;
        }
        const { date, mood, symptoms } = req.body;
        const updated = await symptomService.updateSymptom(symptomId, date, mood, symptoms);
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ error: err.message || 'Failed to update symptom' });
    }
};
exports.updateSymptom = updateSymptom;
const deleteSymptom = async (req, res) => {
    try {
        const symptomId = Number(req.params.id);
        if (isNaN(symptomId)) {
            res.status(400).json({ error: 'Invalid symptom ID' });
            return;
        }
        const { userId, role } = req;
        const existing = await symptomService.getSymptomById(symptomId);
        if (!existing) {
            res.status(404).json({ error: 'Symptom not found' });
            return;
        }
        if (role !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized to delete this symptom' });
            return;
        }
        await symptomService.deleteSymptom(symptomId);
        res.status(204).send();
    }
    catch {
        res.status(500).json({ error: 'Failed to delete symptom' });
    }
};
exports.deleteSymptom = deleteSymptom;
const getSymptomsByUser = async (req, res) => {
    try {
        const role = req.role;
        if (role !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const symptoms = await symptomService.getSymptoms(userId);
        res.json(symptoms);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch symptoms by user' });
    }
};
exports.getSymptomsByUser = getSymptomsByUser;
