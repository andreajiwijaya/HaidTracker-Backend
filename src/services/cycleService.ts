import { prisma } from '../prisma';

export const getAllCycles = async (userId: number, role: string) => {
  if (role === 'admin') {
    return prisma.cycle.findMany({ orderBy: { startDate: 'desc' } });
  }
  return prisma.cycle.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
};

export const getCycle = async (cycleId: number) => {
  return prisma.cycle.findUnique({ where: { id: cycleId } });
};

export const createCycleEntry = async (
  userId: number,
  role: string,
  data: {
    startDate: string;
    endDate?: string;
    note?: string;
    targetUserId?: number;
  }
) => {
  const actualUserId = role === 'admin' && typeof data.targetUserId === 'number'
    ? data.targetUserId
    : userId;

  return prisma.cycle.create({
    data: {
      userId: actualUserId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      note: data.note,
    },
  });
};

export const updateCycleEntry = async (
  cycleId: number,
  data: {
    startDate?: string;
    endDate?: string | null;
    note?: string | null;
  }
) => {
  return prisma.cycle.update({
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

export const deleteCycleEntry = async (cycleId: number) => {
  return prisma.cycle.delete({ where: { id: cycleId } });
};

export const searchUserCycles = async (
  userId: number,
  role: string,
  query: {
    noteKeyword?: string;
    startDate?: string;
  }
) => {
  const where: any = role === 'admin' ? {} : { userId };

  if (query.noteKeyword) {
    where.note = {
      contains: query.noteKeyword,
      mode: 'insensitive',
    };
  }

  if (query.startDate) {
    where.startDate = new Date(query.startDate);
  }

  return prisma.cycle.findMany({
    where,
    orderBy: { startDate: 'desc' },
  });
};

export const getCycleStatistics = async () => {
  return prisma.cycle.groupBy({
    by: ['userId'],
    _count: { id: true },
  });
};
