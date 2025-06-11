"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReminderById = exports.deleteReminder = exports.updateReminder = exports.createReminder = exports.getUserReminders = exports.getAllRemindersForAdmin = void 0;
const prisma_1 = require("../prisma");
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
    if (!title || typeof title !== 'string') {
        throw { status: 400, message: 'Title is required and must be a string' };
    }
    if (!remindAt || !isValidISODateString(remindAt)) {
        throw { status: 400, message: 'Valid remindAt (ISO format) is required' };
    }
    return prisma_1.prisma.reminder.create({
        data: {
            userId,
            title,
            description,
            remindAt: new Date(remindAt),
        },
    });
};
exports.createReminder = createReminder;
const updateReminder = async (reminderId, userId, userRole, title, description, remindAt, isActive) => {
    if (isNaN(reminderId)) {
        throw { status: 400, message: 'Invalid reminder ID' };
    }
    const existingReminder = await prisma_1.prisma.reminder.findUnique({
        where: { id: reminderId },
    });
    if (!existingReminder) {
        throw { status: 404, message: 'Reminder not found' };
    }
    if (userRole !== 'admin' && existingReminder.userId !== userId) {
        throw { status: 403, message: 'Forbidden' };
    }
    const dataToUpdate = {};
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
            throw { status: 400, message: 'Title must be a non-empty string' };
        }
        dataToUpdate.title = title;
    }
    if (description !== undefined) {
        dataToUpdate.description = description;
    }
    if (remindAt !== undefined) {
        if (!isValidISODateString(remindAt)) {
            throw { status: 400, message: 'Invalid remindAt format' };
        }
        dataToUpdate.remindAt = new Date(remindAt);
    }
    if (isActive !== undefined) {
        dataToUpdate.isActive = Boolean(isActive);
    }
    return prisma_1.prisma.reminder.update({
        where: { id: reminderId },
        data: dataToUpdate,
    });
};
exports.updateReminder = updateReminder;
const deleteReminder = async (reminderId, userId, userRole) => {
    if (isNaN(reminderId)) {
        throw { status: 400, message: 'Invalid reminder ID' };
    }
    const existingReminder = await prisma_1.prisma.reminder.findUnique({
        where: { id: reminderId },
    });
    if (!existingReminder) {
        throw { status: 404, message: 'Reminder not found' };
    }
    if (userRole !== 'admin' && existingReminder.userId !== userId) {
        throw { status: 403, message: 'Forbidden' };
    }
    await prisma_1.prisma.reminder.delete({ where: { id: reminderId } });
};
exports.deleteReminder = deleteReminder;
const getReminderById = async (reminderId, userId, userRole) => {
    if (isNaN(reminderId)) {
        throw { status: 400, message: 'Invalid reminder ID' };
    }
    const reminder = await prisma_1.prisma.reminder.findUnique({
        where: { id: reminderId },
    });
    if (!reminder) {
        throw { status: 404, message: 'Reminder not found' };
    }
    if (userRole !== 'admin' && reminder.userId !== userId) {
        throw { status: 403, message: 'Forbidden' };
    }
    return reminder;
};
exports.getReminderById = getReminderById;
