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
exports.getReminderById = exports.deleteReminder = exports.updateReminder = exports.createReminder = exports.getUserReminders = exports.getAllRemindersForAdmin = void 0;
const reminderService = __importStar(require("../services/reminderService"));
// 1. Get all reminders for admin
const getAllRemindersForAdmin = async (req, res) => {
    try {
        const reminders = await reminderService.getAllRemindersForAdmin();
        res.json(reminders);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch reminders for admin' });
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
    catch {
        res.status(500).json({ error: 'Failed to fetch reminders' });
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
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Failed to create reminder' });
    }
};
exports.createReminder = createReminder;
// 4. Update reminder
const updateReminder = async (req, res) => {
    try {
        const reminderId = Number(req.params.id);
        const userId = req.userId;
        const userRole = req.userRole;
        const { title, description, remindAt, isActive } = req.body;
        const updatedReminder = await reminderService.updateReminder(reminderId, userId, userRole, title, description, remindAt, isActive);
        res.json(updatedReminder);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Failed to update reminder' });
    }
};
exports.updateReminder = updateReminder;
// 5. Delete reminder
const deleteReminder = async (req, res) => {
    try {
        const reminderId = Number(req.params.id);
        const userId = req.userId;
        const userRole = req.userRole;
        await reminderService.deleteReminder(reminderId, userId, userRole);
        res.status(204).send();
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Failed to delete reminder' });
    }
};
exports.deleteReminder = deleteReminder;
// 6. Get reminder by ID
const getReminderById = async (req, res) => {
    try {
        const reminderId = Number(req.params.id);
        const userId = req.userId;
        const userRole = req.userRole;
        const reminder = await reminderService.getReminderById(reminderId, userId, userRole);
        res.json(reminder);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Failed to fetch reminder' });
    }
};
exports.getReminderById = getReminderById;
