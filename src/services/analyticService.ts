// src/services/analyticService.ts
import { prisma } from '../prisma';
import AppError from '../utils/AppError'; // Import AppError

const isValidISODateString = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

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
  // Validasi yang lebih ketat di service
  if (!data.periodStart || !isValidISODateString(data.periodStart)) {
    throw new AppError('Tanggal mulai periode wajib diisi dan harus format tanggal valid (ISO).', 400);
  }
  if (!data.periodEnd || !isValidISODateString(data.periodEnd)) {
    throw new AppError('Tanggal akhir periode wajib diisi dan harus format tanggal valid (ISO).', 400);
  }
  if (data.averageCycle !== undefined && typeof data.averageCycle !== 'number') {
    throw new AppError('Rata-rata siklus harus berupa angka jika disediakan.', 400);
  }
  if (data.symptomSummary !== undefined && typeof data.symptomSummary !== 'string') {
    throw new AppError('Ringkasan gejala harus berupa string jika disediakan.', 400);
  }

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
  if (isNaN(analyticId)) {
    throw new AppError('ID analitik tidak valid.', 400);
  }
  const analytic = await prisma.analytic.findUnique({ where: { id: analyticId } });
  if (!analytic) {
    throw new AppError('Analitik tidak ditemukan.', 404);
  }
  return analytic;
};

export const updateAnalyticById = async (analyticId: number, updateData: any) => {
  if (isNaN(analyticId)) {
    throw new AppError('ID analitik tidak valid.', 400);
  }

  // Validasi dataToUpdate yang masuk
  if (updateData.periodStart !== undefined && !isValidISODateString(updateData.periodStart)) {
    throw new AppError('Tanggal mulai periode harus format tanggal valid (ISO) jika disediakan.', 400);
  }
  if (updateData.periodEnd !== undefined && !isValidISODateString(updateData.periodEnd)) {
    throw new AppError('Tanggal akhir periode harus format tanggal valid (ISO) jika disediakan.', 400);
  }
  if (updateData.averageCycle !== undefined && typeof updateData.averageCycle !== 'number' && updateData.averageCycle !== null) {
    throw new AppError('Rata-rata siklus harus berupa angka atau null jika disediakan.', 400);
  }
  if (updateData.symptomSummary !== undefined && typeof updateData.symptomSummary !== 'string' && updateData.symptomSummary !== null) {
    throw new AppError('Ringkasan gejala harus berupa string atau null jika disediakan.', 400);
  }

  // Konversi tanggal jika ada
  const dataToProcess: any = { ...updateData };
  if (dataToProcess.periodStart) {
    dataToProcess.periodStart = new Date(dataToProcess.periodStart);
  }
  if (dataToProcess.periodEnd) {
    dataToProcess.periodEnd = new Date(dataToProcess.periodEnd);
  }


  const existingAnalytic = await prisma.analytic.findUnique({ where: { id: analyticId } });
  if (!existingAnalytic) {
    throw new AppError('Analitik tidak ditemukan.', 404);
  }

  return prisma.analytic.update({
    where: { id: analyticId },
    data: dataToProcess,
  });
};

export const deleteAnalyticById = async (analyticId: number) => {
  if (isNaN(analyticId)) {
    throw new AppError('ID analitik tidak valid.', 400);
  }
  const existingAnalytic = await prisma.analytic.findUnique({ where: { id: analyticId } });
  if (!existingAnalytic) {
    throw new AppError('Analitik tidak ditemukan.', 404);
  }
  return prisma.analytic.delete({ where: { id: analyticId } });
};