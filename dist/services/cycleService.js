"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCycleStatistics = exports.searchUserCycles = exports.deleteCycleEntry = exports.updateCycleEntry = exports.createCycleEntry = exports.getCycle = exports.getAllCycles = void 0;
const prisma_1 = require("../prisma");
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
    return prisma_1.prisma.cycle.findUnique({ where: { id: cycleId } });
};
exports.getCycle = getCycle;
const createCycleEntry = async (userId, role, data) => {
    const actualUserId = role === 'admin' && typeof data.targetUserId === 'number'
        ? data.targetUserId
        : userId;
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
    return prisma_1.prisma.cycle.update({
        where: { id: cycleId },
        data: {
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate !== undefined
                ? data.endDate
                    ? new Date(data.endDate)
                    : null
                : undefined,
            note: data.note !== undefined ? data.note : undefined,
        },
    });
};
exports.updateCycleEntry = updateCycleEntry;
const deleteCycleEntry = async (cycleId) => {
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
        where.startDate = new Date(query.startDate);
    }
    return prisma_1.prisma.cycle.findMany({
        where,
        orderBy: { startDate: 'desc' },
    });
};
exports.searchUserCycles = searchUserCycles;
const getCycleStatistics = async () => {
    return prisma_1.prisma.cycle.groupBy({
        by: ['userId'],
        _count: { id: true },
    });
};
exports.getCycleStatistics = getCycleStatistics;
