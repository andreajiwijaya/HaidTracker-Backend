"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSymptom = exports.updateSymptom = exports.createSymptom = exports.getSymptomById = exports.getSymptoms = void 0;
// src/services/symptomService.ts
const prisma_1 = require("../prisma");
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
const isValidDate = (dateStr) => {
    return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};
const getSymptoms = async (userId) => {
    return prisma_1.prisma.symptom.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
    });
};
exports.getSymptoms = getSymptoms;
const getSymptomById = async (id) => {
    if (isNaN(id)) {
        throw new AppError_1.default('ID gejala tidak valid.', 400);
    }
    const symptom = await prisma_1.prisma.symptom.findUnique({ where: { id } });
    if (!symptom) {
        throw new AppError_1.default('Gejala tidak ditemukan.', 404);
    }
    return symptom;
};
exports.getSymptomById = getSymptomById;
const createSymptom = async (userId, date, mood, symptoms) => {
    if (!date || !isValidDate(date)) {
        throw new AppError_1.default('Tanggal wajib diisi dan harus format tanggal valid (ISO).', 400);
    }
    if (!mood || typeof mood !== 'string' || mood.trim() === '') {
        throw new AppError_1.default('Suasana hati wajib diisi dan harus berupa string yang tidak kosong.', 400);
    }
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
        throw new AppError_1.default('Gejala wajib diisi dan harus berupa string yang tidak kosong.', 400);
    }
    return prisma_1.prisma.symptom.create({
        data: {
            userId,
            date: new Date(date),
            mood: mood.trim(),
            symptoms: symptoms.trim(),
        },
    });
};
exports.createSymptom = createSymptom;
const updateSymptom = async (id, date, mood, symptoms) => {
    if (isNaN(id)) {
        throw new AppError_1.default('ID gejala tidak valid.', 400);
    }
    const existing = await prisma_1.prisma.symptom.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError_1.default('Gejala tidak ditemukan.', 404);
    }
    const dataToUpdate = {};
    if (date !== undefined) {
        if (!isValidDate(date)) {
            throw new AppError_1.default('Tanggal harus format tanggal valid (ISO) jika disediakan.', 400);
        }
        dataToUpdate.date = new Date(date);
    }
    if (mood !== undefined) {
        if (typeof mood !== 'string' || mood.trim() === '') {
            throw new AppError_1.default('Suasana hati harus berupa string yang tidak kosong jika disediakan.', 400);
        }
        dataToUpdate.mood = mood.trim();
    }
    if (symptoms !== undefined) {
        if (typeof symptoms !== 'string' || symptoms.trim() === '') {
            throw new AppError_1.default('Gejala harus berupa string yang tidak kosong jika disediakan.', 400);
        }
        dataToUpdate.symptoms = symptoms.trim();
    }
    return prisma_1.prisma.symptom.update({
        where: { id },
        data: dataToUpdate,
    });
};
exports.updateSymptom = updateSymptom;
const deleteSymptom = async (id) => {
    if (isNaN(id)) {
        throw new AppError_1.default('ID gejala tidak valid.', 400);
    }
    const existing = await prisma_1.prisma.symptom.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError_1.default('Gejala tidak ditemukan.', 404);
    }
    return prisma_1.prisma.symptom.delete({ where: { id } });
};
exports.deleteSymptom = deleteSymptom;
