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
exports.getReminderById = exports.deleteReminder = exports.updateReminder = exports.createReminder = exports.getUserReminders = exports.getAllRemindersForAdmin = void 0;
const reminderService = __importStar(require("../services/reminderService"));
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
// 1. Get all reminders for admin
const getAllRemindersForAdmin = async (req, res) => {
    try {
        // Middleware authorizeRole sudah mengurus otorisasi admin
        const reminders = await reminderService.getAllRemindersForAdmin();
        res.json(reminders);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil semua pengingat untuk admin.' });
        }
    }
};
exports.getAllRemindersForAdmin = getAllRemindersForAdmin;
// 2. Get reminders for logged-in user
const getUserReminders = async (req, res) => {
    try {
        const userId = req.userId;
        const reminders = await reminderService.getUserReminders(userId);
        res.json(reminders);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil pengingat Anda.' });
        }
    }
};
exports.getUserReminders = getUserReminders;
// 3. Create reminder
const createReminder = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, remindAt } = req.body;
        const reminder = await reminderService.createReminder(userId, title, description, remindAt);
        res.status(201).json(reminder);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal membuat pengingat.' });
        }
    }
};
exports.createReminder = createReminder;
// 4. Update reminder
const updateReminder = async (req, res) => {
    try {
        const reminderId = Number(req.params.id);
        // Perbaikan: Validasi ID di controller
        if (isNaN(reminderId)) {
            res.status(400).json({ error: 'ID pengingat tidak valid.' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const { title, description, remindAt, isActive } = req.body;
        const updatedReminder = await reminderService.updateReminder(reminderId, userId, userRole, title, description, remindAt, isActive);
        res.json(updatedReminder);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal memperbarui pengingat.' });
        }
    }
};
exports.updateReminder = updateReminder;
// 5. Delete reminder
const deleteReminder = async (req, res) => {
    try {
        const reminderId = Number(req.params.id);
        // Perbaikan: Validasi ID di controller
        if (isNaN(reminderId)) {
            res.status(400).json({ error: 'ID pengingat tidak valid.' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        await reminderService.deleteReminder(reminderId, userId, userRole);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal menghapus pengingat.' });
        }
    }
};
exports.deleteReminder = deleteReminder;
// 6. Get reminder by ID
const getReminderById = async (req, res) => {
    try {
        const reminderId = Number(req.params.id);
        // Perbaikan: Validasi ID di controller
        if (isNaN(reminderId)) {
            res.status(400).json({ error: 'ID pengingat tidak valid.' });
            return;
        }
        const userId = req.userId;
        const userRole = req.userRole;
        const reminder = await reminderService.getReminderById(reminderId, userId, userRole);
        res.json(reminder);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil detail pengingat.' });
        }
    }
};
exports.getReminderById = getReminderById;
