"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSymptom = exports.updateSymptom = exports.createSymptom = exports.getSymptomById = exports.getSymptoms = void 0;
const prisma_1 = require("../prisma");
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
    return prisma_1.prisma.symptom.findUnique({ where: { id } });
};
exports.getSymptomById = getSymptomById;
const createSymptom = async (userId, date, mood, symptoms) => {
    if (!date || !isValidDate(date)) {
        throw new Error('Date is required and must be valid ISO date');
    }
    if (!mood || typeof mood !== 'string' || mood.trim() === '') {
        throw new Error('Mood is required and must be a non-empty string');
    }
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
        throw new Error('Symptoms are required and must be a non-empty string');
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
    if (date !== undefined && date !== null && !isValidDate(date)) {
        throw new Error('Date must be a valid ISO date if provided');
    }
    if (mood !== undefined && mood !== null && (typeof mood !== 'string' || mood.trim() === '')) {
        throw new Error('Mood must be a non-empty string if provided');
    }
    if (symptoms !== undefined && symptoms !== null && (typeof symptoms !== 'string' || symptoms.trim() === '')) {
        throw new Error('Symptoms must be a non-empty string if provided');
    }
    const existing = await prisma_1.prisma.symptom.findUnique({ where: { id } });
    if (!existing)
        return null;
    return prisma_1.prisma.symptom.update({
        where: { id },
        data: {
            date: date ? new Date(date) : existing.date,
            mood: mood ? mood.trim() : existing.mood,
            symptoms: symptoms ? symptoms.trim() : existing.symptoms,
        },
    });
};
exports.updateSymptom = updateSymptom;
const deleteSymptom = async (id) => {
    return prisma_1.prisma.symptom.delete({ where: { id } });
};
exports.deleteSymptom = deleteSymptom;
