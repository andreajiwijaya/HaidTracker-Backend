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
exports.getAnalyticById = exports.deleteAnalytic = exports.updateAnalytic = exports.createAnalytic = exports.getUserAnalytics = exports.getAllAnalyticsForAdmin = void 0;
const analyticService = __importStar(require("../services/analyticService"));
const isValidISODateString = (dateStr) => {
    return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};
// 1. Admin: Get all analytics
const getAllAnalyticsForAdmin = async (req, res) => {
    try {
        const analytics = await analyticService.getAllAnalytics();
        res.json(analytics);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch analytics' });
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
    catch {
        res.status(500).json({ error: 'Failed to fetch your analytics' });
    }
};
exports.getUserAnalytics = getUserAnalytics;
// 3. Create analytic (user)
const createAnalytic = async (req, res) => {
    const userId = req.userId;
    const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;
    if (!isValidISODateString(periodStart) || !isValidISODateString(periodEnd)) {
        res.status(400).json({ error: 'Valid periodStart and periodEnd are required' });
        return;
    }
    try {
        const analytic = await analyticService.createAnalyticForUser(userId, {
            periodStart,
            periodEnd,
            averageCycle,
            symptomSummary,
        });
        res.status(201).json(analytic);
    }
    catch {
        res.status(500).json({ error: 'Failed to create analytic' });
    }
};
exports.createAnalytic = createAnalytic;
// 4. Update analytic
const updateAnalytic = async (req, res) => {
    try {
        const analyticId = Number(req.params.id);
        if (isNaN(analyticId)) {
            res.status(400).json({ error: 'Invalid analytic ID' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;
        const existingAnalytic = await analyticService.getAnalyticById(analyticId);
        if (!existingAnalytic) {
            res.status(404).json({ error: 'Analytic not found' });
            return;
        }
        if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const dataToUpdate = {};
        if (periodStart && isValidISODateString(periodStart)) {
            dataToUpdate.periodStart = new Date(periodStart);
        }
        if (periodEnd && isValidISODateString(periodEnd)) {
            dataToUpdate.periodEnd = new Date(periodEnd);
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
    catch {
        res.status(500).json({ error: 'Failed to update analytic' });
    }
};
exports.updateAnalytic = updateAnalytic;
// 5. Delete analytic
const deleteAnalytic = async (req, res) => {
    try {
        const analyticId = Number(req.params.id);
        if (isNaN(analyticId)) {
            res.status(400).json({ error: 'Invalid analytic ID' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const existingAnalytic = await analyticService.getAnalyticById(analyticId);
        if (!existingAnalytic) {
            res.status(404).json({ error: 'Analytic not found' });
            return;
        }
        if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await analyticService.deleteAnalyticById(analyticId);
        res.status(204).send();
    }
    catch {
        res.status(500).json({ error: 'Failed to delete analytic' });
    }
};
exports.deleteAnalytic = deleteAnalytic;
// 6. Get analytic by ID
const getAnalyticById = async (req, res) => {
    try {
        const analyticId = Number(req.params.id);
        if (isNaN(analyticId)) {
            res.status(400).json({ error: 'Invalid analytic ID' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const analytic = await analyticService.getAnalyticById(analyticId);
        if (!analytic) {
            res.status(404).json({ error: 'Analytic not found' });
            return;
        }
        if (userRole !== 'admin' && analytic.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.json(analytic);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch analytic' });
    }
};
exports.getAnalyticById = getAnalyticById;
// 7. Get analytics by user ID (admin only)
