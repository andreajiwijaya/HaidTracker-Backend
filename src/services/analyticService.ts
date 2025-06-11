import { prisma } from '../prisma';

export const getAllAnalytics = async () => {
  return prisma.analytic.findMany({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { periodStart: 'desc' },
  });
};

export const getAnalyticsByUserId = async (userId: number) => {
  return prisma.analytic.findMany({
    where: { userId },
    orderBy: { periodStart: 'desc' },
  });
};

export const createAnalyticForUser = async (
  userId: number,
  data: { periodStart: string; periodEnd: string; averageCycle?: number; symptomSummary?: string }
) => {
  return prisma.analytic.create({
    data: {
      userId,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      averageCycle: data.averageCycle,
      symptomSummary: data.symptomSummary,
    },
  });
};

export const getAnalyticById = async (analyticId: number) => {
  return prisma.analytic.findUnique({ where: { id: analyticId } });
};

export const updateAnalyticById = async (analyticId: number, updateData: any) => {
  return prisma.analytic.update({
    where: { id: analyticId },
    data: updateData,
  });
};

export const deleteAnalyticById = async (analyticId: number) => {
  return prisma.analytic.delete({ where: { id: analyticId } });
};
