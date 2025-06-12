"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCycleStatistics = exports.searchUserCycles = exports.deleteCycleEntry = exports.updateCycleEntry = exports.createCycleEntry = exports.getCycle = exports.getAllCycles = void 0;
// src/services/cycleService.ts
const prisma_1 = require("../prisma");
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
// Helper untuk validasi tanggal (bisa juga di utils/validation.ts)
const isValidISODateString = (dateStr) => {
    return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};
const getAllCycles = async (userId, role) => {
    if (role === 'admin') {
        return prisma_1.prisma.cycle.findMany({ orderBy: { startDate: 'desc' } });
    }
    return prisma_1.prisma.cycle.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' },
    });
};
exports.getAllCycles = getAllCycles;
const getCycle = async (cycleId) => {
    if (isNaN(cycleId)) {
        throw new AppError_1.default('ID siklus tidak valid.', 400);
    }
    const cycle = await prisma_1.prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!cycle) {
        throw new AppError_1.default('Siklus tidak ditemukan.', 404);
    }
    return cycle;
};
exports.getCycle = getCycle;
const createCycleEntry = async (userId, role, data) => {
    if (!data.startDate || !isValidISODateString(data.startDate)) {
        throw new AppError_1.default('Tanggal mulai wajib diisi dan harus format tanggal valid (ISO).', 400);
    }
    if (data.endDate && !isValidISODateString(data.endDate)) {
        throw new AppError_1.default('Tanggal selesai harus format tanggal valid (ISO) jika disediakan.', 400);
    }
    if (data.note && typeof data.note !== 'string') {
        throw new AppError_1.default('Catatan harus berupa string jika disediakan.', 400);
    }
    const actualUserId = role === 'admin' && typeof data.targetUserId === 'number'
        ? data.targetUserId
        : userId;
    // Verifikasi targetUserId jika admin mencoba membuat untuk user lain
    if (role === 'admin' && typeof data.targetUserId === 'number' && data.targetUserId !== userId) {
        const targetUserExists = await prisma_1.prisma.user.findUnique({ where: { id: data.targetUserId } });
        if (!targetUserExists) {
            throw new AppError_1.default('ID pengguna target tidak ditemukan.', 404);
        }
    }
    return prisma_1.prisma.cycle.create({
        data: {
            userId: actualUserId,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            note: data.note,
        },
    });
};
exports.createCycleEntry = createCycleEntry;
const updateCycleEntry = async (cycleId, data) => {
    if (isNaN(cycleId)) {
        throw new AppError_1.default('ID siklus tidak valid.', 400);
    }
    if (data.startDate !== undefined && !isValidISODateString(data.startDate)) {
        throw new AppError_1.default('Tanggal mulai harus format tanggal valid (ISO) jika disediakan.', 400);
    }
    if (data.endDate !== undefined && data.endDate !== null && !isValidISODateString(data.endDate)) {
        throw new AppError_1.default('Tanggal selesai harus format tanggal valid (ISO) atau null jika disediakan.', 400);
    }
    if (data.note !== undefined && typeof data.note !== 'string' && data.note !== null) {
        throw new AppError_1.default('Catatan harus berupa string atau null jika disediakan.', 400);
    }
    const existing = await prisma_1.prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing) {
        throw new AppError_1.default('Siklus tidak ditemukan.', 404);
    }
    const dataToUpdate = {};
    if (data.startDate !== undefined)
        dataToUpdate.startDate = new Date(data.startDate);
    if (data.endDate !== undefined)
        dataToUpdate.endDate = data.endDate === null ? null : new Date(data.endDate);
    if (data.note !== undefined)
        dataToUpdate.note = data.note;
    return prisma_1.prisma.cycle.update({
        where: { id: cycleId },
        data: dataToUpdate,
    });
};
exports.updateCycleEntry = updateCycleEntry;
const deleteCycleEntry = async (cycleId) => {
    if (isNaN(cycleId)) {
        throw new AppError_1.default('ID siklus tidak valid.', 400);
    }
    const existing = await prisma_1.prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing) {
        throw new AppError_1.default('Siklus tidak ditemukan.', 404);
    }
    return prisma_1.prisma.cycle.delete({ where: { id: cycleId } });
};
exports.deleteCycleEntry = deleteCycleEntry;
const searchUserCycles = async (userId, role, query) => {
    const where = role === 'admin' ? {} : { userId };
    if (query.noteKeyword) {
        where.note = {
            contains: query.noteKeyword,
            mode: 'insensitive',
        };
    }
    if (query.startDate) {
        if (!isValidISODateString(query.startDate)) {
            throw new AppError_1.default('Tanggal mulai pencarian harus format tanggal valid (ISO).', 400);
        }
        where.startDate = new Date(query.startDate);
    }
    return prisma_1.prisma.cycle.findMany({
        where,
        orderBy: { startDate: 'desc' },
    });
};
exports.searchUserCycles = searchUserCycles;
const getCycleStatistics = async () => {
    // Anda bisa memperluas statistik di sini.
    // Contoh: Menghitung rata-rata panjang siklus untuk semua user atau per user
    const cycleCounts = await prisma_1.prisma.cycle.groupBy({
        by: ['userId'],
        _count: { id: true },
    });
    const totalCycles = await prisma_1.prisma.cycle.count();
    return {
        totalCycles,
        cycleCountsByUser: cycleCounts,
        // Di sini Anda bisa menambahkan rata-rata panjang siklus, dll.
    };
};
exports.getCycleStatistics = getCycleStatistics;
