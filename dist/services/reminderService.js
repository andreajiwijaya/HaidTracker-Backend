"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReminderById = exports.deleteReminder = exports.updateReminder = exports.createReminder = exports.getUserReminders = exports.getAllRemindersForAdmin = void 0;
// src/services/reminderService.ts
const prisma_1 = require("../prisma");
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
const isValidISODateString = (dateStr) => {
    return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};
const getAllRemindersForAdmin = async () => {
    return prisma_1.prisma.reminder.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { remindAt: 'asc' },
    });
};
exports.getAllRemindersForAdmin = getAllRemindersForAdmin;
const getUserReminders = async (userId) => {
    return prisma_1.prisma.reminder.findMany({
        where: { userId },
        orderBy: { remindAt: 'asc' },
    });
};
exports.getUserReminders = getUserReminders;
const createReminder = async (userId, title, description, remindAt) => {
    if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new AppError_1.default('Judul wajib diisi dan harus berupa string yang tidak kosong.', 400);
    }
    if (!remindAt || !isValidISODateString(remindAt)) {
        throw new AppError_1.default('Tanggal pengingat wajib diisi dan harus format tanggal valid (ISO).', 400);
    }
    // Perbaikan: Validasi untuk description
    if (description !== undefined && description !== null && typeof description !== 'string') {
        throw new AppError_1.default('Deskripsi harus berupa string atau null jika disediakan.', 400);
    }
    return prisma_1.prisma.reminder.create({
        data: {
            userId,
            title: title.trim(),
            description: description ? description.trim() : null, // Pastikan tersimpan sebagai null jika kosong
            remindAt: new Date(remindAt),
        },
    });
};
exports.createReminder = createReminder;
const updateReminder = async (reminderId, userId, userRole, title, description, // Bisa null
remindAt, isActive) => {
    if (isNaN(reminderId)) {
        throw new AppError_1.default('ID pengingat tidak valid.', 400);
    }
    const existingReminder = await prisma_1.prisma.reminder.findUnique({
        where: { id: reminderId },
    });
    if (!existingReminder) {
        throw new AppError_1.default('Pengingat tidak ditemukan.', 404);
    }
    // Otorisasi
    if (userRole !== 'admin' && existingReminder.userId !== userId) {
        throw new AppError_1.default('Terlarang: Anda tidak memiliki akses ke pengingat ini.', 403);
    }
    const dataToUpdate = {};
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
            throw new AppError_1.default('Judul harus berupa string yang tidak kosong.', 400);
        }
        dataToUpdate.title = title.trim();
    }
    if (description !== undefined) {
        if (description !== null && typeof description !== 'string') {
            throw new AppError_1.default('Deskripsi harus berupa string atau null jika disediakan.', 400);
        }
        dataToUpdate.description = description ? description.trim() : null;
    }
    if (remindAt !== undefined) {
        if (!isValidISODateString(remindAt)) {
            throw new AppError_1.default('Format tanggal pengingat tidak valid.', 400);
        }
        dataToUpdate.remindAt = new Date(remindAt);
    }
    if (isActive !== undefined) {
        if (typeof isActive !== 'boolean') {
            throw new AppError_1.default('isActive harus berupa boolean.', 400);
        }
        dataToUpdate.isActive = isActive;
    }
    return prisma_1.prisma.reminder.update({
        where: { id: reminderId },
        data: dataToUpdate,
    });
};
exports.updateReminder = updateReminder;
const deleteReminder = async (reminderId, userId, userRole) => {
    if (isNaN(reminderId)) {
        throw new AppError_1.default('ID pengingat tidak valid.', 400);
    }
    const existingReminder = await prisma_1.prisma.reminder.findUnique({
        where: { id: reminderId },
    });
    if (!existingReminder) {
        throw new AppError_1.default('Pengingat tidak ditemukan.', 404);
    }
    // Otorisasi
    if (userRole !== 'admin' && existingReminder.userId !== userId) {
        throw new AppError_1.default('Terlarang: Anda tidak memiliki akses ke pengingat ini.', 403);
    }
    await prisma_1.prisma.reminder.delete({ where: { id: reminderId } });
};
exports.deleteReminder = deleteReminder;
const getReminderById = async (reminderId, userId, userRole) => {
    if (isNaN(reminderId)) {
        throw new AppError_1.default('ID pengingat tidak valid.', 400);
    }
    const reminder = await prisma_1.prisma.reminder.findUnique({
        where: { id: reminderId },
    });
    if (!reminder) {
        throw new AppError_1.default('Pengingat tidak ditemukan.', 404);
    }
    // Otorisasi
    if (userRole !== 'admin' && reminder.userId !== userId) {
        throw new AppError_1.default('Terlarang: Anda tidak memiliki akses ke pengingat ini.', 403);
    }
    return reminder;
};
exports.getReminderById = getReminderById;
