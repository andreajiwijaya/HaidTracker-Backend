// src/services/cycleService.ts
import { prisma } from '../prisma';
import AppError from '../utils/AppError'; // Import AppError

// Helper untuk validasi tanggal (bisa juga di utils/validation.ts)
const isValidISODateString = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

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
  if (isNaN(cycleId)) {
    throw new AppError('ID siklus tidak valid.', 400);
  }
  const cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
  if (!cycle) {
    throw new AppError('Siklus tidak ditemukan.', 404);
  }
  return cycle;
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
  if (!data.startDate || !isValidISODateString(data.startDate)) {
    throw new AppError('Tanggal mulai wajib diisi dan harus format tanggal valid (ISO).', 400);
  }
  if (data.endDate && !isValidISODateString(data.endDate)) {
    throw new AppError('Tanggal selesai harus format tanggal valid (ISO) jika disediakan.', 400);
  }
  if (data.note && typeof data.note !== 'string') {
    throw new AppError('Catatan harus berupa string jika disediakan.', 400);
  }

  const actualUserId = role === 'admin' && typeof data.targetUserId === 'number'
    ? data.targetUserId
    : userId;

  // Verifikasi targetUserId jika admin mencoba membuat untuk user lain
  if (role === 'admin' && typeof data.targetUserId === 'number' && data.targetUserId !== userId) {
    const targetUserExists = await prisma.user.findUnique({ where: { id: data.targetUserId } });
    if (!targetUserExists) {
      throw new AppError('ID pengguna target tidak ditemukan.', 404);
    }
  }


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
  if (isNaN(cycleId)) {
    throw new AppError('ID siklus tidak valid.', 400);
  }

  if (data.startDate !== undefined && !isValidISODateString(data.startDate)) {
    throw new AppError('Tanggal mulai harus format tanggal valid (ISO) jika disediakan.', 400);
  }
  if (data.endDate !== undefined && data.endDate !== null && !isValidISODateString(data.endDate)) {
    throw new AppError('Tanggal selesai harus format tanggal valid (ISO) atau null jika disediakan.', 400);
  }
  if (data.note !== undefined && typeof data.note !== 'string' && data.note !== null) {
    throw new AppError('Catatan harus berupa string atau null jika disediakan.', 400);
  }

  const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
  if (!existing) {
    throw new AppError('Siklus tidak ditemukan.', 404);
  }

  const dataToUpdate: any = {};
  if (data.startDate !== undefined) dataToUpdate.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) dataToUpdate.endDate = data.endDate === null ? null : new Date(data.endDate);
  if (data.note !== undefined) dataToUpdate.note = data.note;


  return prisma.cycle.update({
    where: { id: cycleId },
    data: dataToUpdate,
  });
};

export const deleteCycleEntry = async (cycleId: number) => {
  if (isNaN(cycleId)) {
    throw new AppError('ID siklus tidak valid.', 400);
  }
  const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
  if (!existing) {
    throw new AppError('Siklus tidak ditemukan.', 404);
  }
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
    if (!isValidISODateString(query.startDate)) {
      throw new AppError('Tanggal mulai pencarian harus format tanggal valid (ISO).', 400);
    }
    where.startDate = new Date(query.startDate);
  }

  return prisma.cycle.findMany({
    where,
    orderBy: { startDate: 'desc' },
  });
};

export const getCycleStatistics = async () => {
  // Anda bisa memperluas statistik di sini.
  // Contoh: Menghitung rata-rata panjang siklus untuk semua user atau per user
  const cycleCounts = await prisma.cycle.groupBy({
    by: ['userId'],
    _count: { id: true },
  });

  const totalCycles = await prisma.cycle.count();

  return {
    totalCycles,
    cycleCountsByUser: cycleCounts,
    // Di sini Anda bisa menambahkan rata-rata panjang siklus, dll.
  };
};