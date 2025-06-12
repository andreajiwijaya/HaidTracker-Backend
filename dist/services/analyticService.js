"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnalyticById = exports.updateAnalyticById = exports.getAnalyticById = exports.createAnalyticForUser = exports.getAnalyticsByUserId = exports.getAllAnalytics = void 0;
// src/services/analyticService.ts
const prisma_1 = require("../prisma");
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
const isValidISODateString = (dateStr) => {
    return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};
const getAllAnalytics = async () => {
    return prisma_1.prisma.analytic.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { periodStart: 'desc' },
    });
};
exports.getAllAnalytics = getAllAnalytics;
const getAnalyticsByUserId = async (userId) => {
    return prisma_1.prisma.analytic.findMany({
        where: { userId },
        orderBy: { periodStart: 'desc' },
    });
};
exports.getAnalyticsByUserId = getAnalyticsByUserId;
const createAnalyticForUser = async (userId, data) => {
    // Validasi yang lebih ketat di service
    if (!data.periodStart || !isValidISODateString(data.periodStart)) {
        throw new AppError_1.default('Tanggal mulai periode wajib diisi dan harus format tanggal valid (ISO).', 400);
    }
    if (!data.periodEnd || !isValidISODateString(data.periodEnd)) {
        throw new AppError_1.default('Tanggal akhir periode wajib diisi dan harus format tanggal valid (ISO).', 400);
    }
    if (data.averageCycle !== undefined && typeof data.averageCycle !== 'number') {
        throw new AppError_1.default('Rata-rata siklus harus berupa angka jika disediakan.', 400);
    }
    if (data.symptomSummary !== undefined && typeof data.symptomSummary !== 'string') {
        throw new AppError_1.default('Ringkasan gejala harus berupa string jika disediakan.', 400);
    }
    return prisma_1.prisma.analytic.create({
        data: {
            userId,
            periodStart: new Date(data.periodStart),
            periodEnd: new Date(data.periodEnd),
            averageCycle: data.averageCycle,
            symptomSummary: data.symptomSummary,
        },
    });
};
exports.createAnalyticForUser = createAnalyticForUser;
const getAnalyticById = async (analyticId) => {
    if (isNaN(analyticId)) {
        throw new AppError_1.default('ID analitik tidak valid.', 400);
    }
    const analytic = await prisma_1.prisma.analytic.findUnique({ where: { id: analyticId } });
    if (!analytic) {
        throw new AppError_1.default('Analitik tidak ditemukan.', 404);
    }
    return analytic;
};
exports.getAnalyticById = getAnalyticById;
const updateAnalyticById = async (analyticId, updateData) => {
    if (isNaN(analyticId)) {
        throw new AppError_1.default('ID analitik tidak valid.', 400);
    }
    // Validasi dataToUpdate yang masuk
    if (updateData.periodStart !== undefined && !isValidISODateString(updateData.periodStart)) {
        throw new AppError_1.default('Tanggal mulai periode harus format tanggal valid (ISO) jika disediakan.', 400);
    }
    if (updateData.periodEnd !== undefined && !isValidISODateString(updateData.periodEnd)) {
        throw new AppError_1.default('Tanggal akhir periode harus format tanggal valid (ISO) jika disediakan.', 400);
    }
    if (updateData.averageCycle !== undefined && typeof updateData.averageCycle !== 'number' && updateData.averageCycle !== null) {
        throw new AppError_1.default('Rata-rata siklus harus berupa angka atau null jika disediakan.', 400);
    }
    if (updateData.symptomSummary !== undefined && typeof updateData.symptomSummary !== 'string' && updateData.symptomSummary !== null) {
        throw new AppError_1.default('Ringkasan gejala harus berupa string atau null jika disediakan.', 400);
    }
    // Konversi tanggal jika ada
    const dataToProcess = { ...updateData };
    if (dataToProcess.periodStart) {
        dataToProcess.periodStart = new Date(dataToProcess.periodStart);
    }
    if (dataToProcess.periodEnd) {
        dataToProcess.periodEnd = new Date(dataToProcess.periodEnd);
    }
    const existingAnalytic = await prisma_1.prisma.analytic.findUnique({ where: { id: analyticId } });
    if (!existingAnalytic) {
        throw new AppError_1.default('Analitik tidak ditemukan.', 404);
    }
    return prisma_1.prisma.analytic.update({
        where: { id: analyticId },
        data: dataToProcess,
    });
};
exports.updateAnalyticById = updateAnalyticById;
const deleteAnalyticById = async (analyticId) => {
    if (isNaN(analyticId)) {
        throw new AppError_1.default('ID analitik tidak valid.', 400);
    }
    const existingAnalytic = await prisma_1.prisma.analytic.findUnique({ where: { id: analyticId } });
    if (!existingAnalytic) {
        throw new AppError_1.default('Analitik tidak ditemukan.', 404);
    }
    return prisma_1.prisma.analytic.delete({ where: { id: analyticId } });
};
exports.deleteAnalyticById = deleteAnalyticById;
