"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnalyticById = exports.updateAnalyticById = exports.getAnalyticById = exports.createAnalyticForUser = exports.getAnalyticsByUserId = exports.getAllAnalytics = void 0;
const prisma_1 = require("../prisma");
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
    return prisma_1.prisma.analytic.findUnique({ where: { id: analyticId } });
};
exports.getAnalyticById = getAnalyticById;
const updateAnalyticById = async (analyticId, updateData) => {
    return prisma_1.prisma.analytic.update({
        where: { id: analyticId },
        data: updateData,
    });
};
exports.updateAnalyticById = updateAnalyticById;
const deleteAnalyticById = async (analyticId) => {
    return prisma_1.prisma.analytic.delete({ where: { id: analyticId } });
};
exports.deleteAnalyticById = deleteAnalyticById;
