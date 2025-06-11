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
exports.getCycleStats = exports.searchCycles = exports.deleteCycle = exports.updateCycle = exports.createCycle = exports.getCycleById = exports.getCycles = void 0;
const cycleService = __importStar(require("../services/cycleService"));
const isValidDate = (dateStr) => typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
const parseUserId = (req) => req.userId;
const parseUserRole = (req) => req.role;
const getCycles = async (req, res) => {
    try {
        const userId = parseUserId(req);
        const role = parseUserRole(req);
        const cycles = await cycleService.getAllCycles(userId, role);
        res.json(cycles);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch cycles' });
    }
};
exports.getCycles = getCycles;
const getCycleById = async (req, res) => {
    try {
        const userId = parseUserId(req);
        const role = parseUserRole(req);
        const cycleId = Number(req.params.id);
        if (isNaN(cycleId)) {
            res.status(400).json({ error: 'Invalid cycle ID' });
            return;
        }
        const cycle = await cycleService.getCycle(cycleId);
        if (!cycle) {
            res.status(404).json({ error: 'Cycle not found' });
            return;
        }
        if (role !== 'admin' && cycle.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized to view this cycle' });
            return;
        }
        res.json(cycle);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch cycle' });
    }
};
exports.getCycleById = getCycleById;
const createCycle = async (req, res) => {
    try {
        const userId = parseUserId(req);
        const role = parseUserRole(req);
        const { startDate, endDate, note, userId: targetUserId } = req.body;
        if (!startDate || !isValidDate(startDate)) {
            res.status(400).json({ error: 'startDate is required and must be a valid date' });
            return;
        }
        if (endDate && !isValidDate(endDate)) {
            res.status(400).json({ error: 'endDate must be a valid date if provided' });
            return;
        }
        if (note && typeof note !== 'string') {
            res.status(400).json({ error: 'note must be a string if provided' });
            return;
        }
        const cycle = await cycleService.createCycleEntry(userId, role, {
            startDate,
            endDate,
            note,
            targetUserId,
        });
        res.status(201).json(cycle);
    }
    catch {
        res.status(500).json({ error: 'Failed to create cycle' });
    }
};
exports.createCycle = createCycle;
const updateCycle = async (req, res) => {
    try {
        const userId = parseUserId(req);
        const role = parseUserRole(req);
        const cycleId = Number(req.params.id);
        if (isNaN(cycleId)) {
            res.status(400).json({ error: 'Invalid cycle ID' });
            return;
        }
        const existing = await cycleService.getCycle(cycleId);
        if (!existing) {
            res.status(404).json({ error: 'Cycle not found' });
            return;
        }
        if (role !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized to update this cycle' });
            return;
        }
        const { startDate, endDate, note } = req.body;
        if (startDate !== undefined && !isValidDate(startDate)) {
            res.status(400).json({ error: 'startDate must be a valid date if provided' });
            return;
        }
        if (endDate !== undefined && endDate !== null && !isValidDate(endDate)) {
            res.status(400).json({ error: 'endDate must be a valid date or null if provided' });
            return;
        }
        if (note !== undefined && typeof note !== 'string' && note !== null) {
            res.status(400).json({ error: 'note must be a string or null if provided' });
            return;
        }
        const updated = await cycleService.updateCycleEntry(cycleId, { startDate, endDate, note });
        res.json(updated);
    }
    catch {
        res.status(500).json({ error: 'Failed to update cycle' });
    }
};
exports.updateCycle = updateCycle;
const deleteCycle = async (req, res) => {
    try {
        const userId = parseUserId(req);
        const role = parseUserRole(req);
        const cycleId = Number(req.params.id);
        if (isNaN(cycleId)) {
            res.status(400).json({ error: 'Invalid cycle ID' });
            return;
        }
        const existing = await cycleService.getCycle(cycleId);
        if (!existing) {
            res.status(404).json({ error: 'Cycle not found' });
            return;
        }
        if (role !== 'admin' && existing.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized to delete this cycle' });
            return;
        }
        await cycleService.deleteCycleEntry(cycleId);
        res.status(204).send();
    }
    catch {
        res.status(500).json({ error: 'Failed to delete cycle' });
    }
};
exports.deleteCycle = deleteCycle;
const searchCycles = async (req, res) => {
    try {
        const userId = parseUserId(req);
        const role = parseUserRole(req);
        const { noteKeyword, startDate } = req.query;
        const cycles = await cycleService.searchUserCycles(userId, role, {
            noteKeyword: noteKeyword,
            startDate: startDate,
        });
        res.json(cycles);
    }
    catch {
        res.status(500).json({ error: 'Failed to search cycles' });
    }
};
exports.searchCycles = searchCycles;
const getCycleStats = async (req, res) => {
    try {
        const role = parseUserRole(req);
        if (role !== 'admin') {
            res.status(403).json({ error: 'Unauthorized to access statistics' });
            return;
        }
        const stats = await cycleService.getCycleStatistics();
        res.json(stats);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch cycle statistics' });
    }
};
exports.getCycleStats = getCycleStats;
