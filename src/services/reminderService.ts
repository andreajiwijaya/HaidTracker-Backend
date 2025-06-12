// src/services/reminderService.ts
import { prisma } from '../prisma';
import AppError from '../utils/AppError'; // Import AppError

const isValidISODateString = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

export const getAllRemindersForAdmin = async () => {
  return prisma.reminder.findMany({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { remindAt: 'asc' },
  });
};

export const getUserReminders = async (userId: number) => {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { remindAt: 'asc' },
  });
};

export const createReminder = async (
  userId: number,
  title: string,
  description?: string,
  remindAt?: string
) => {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError('Judul wajib diisi dan harus berupa string yang tidak kosong.', 400);
  }

  if (!remindAt || !isValidISODateString(remindAt)) {
    throw new AppError('Tanggal pengingat wajib diisi dan harus format tanggal valid (ISO).', 400);
  }

  // Perbaikan: Validasi untuk description
  if (description !== undefined && description !== null && typeof description !== 'string') {
    throw new AppError('Deskripsi harus berupa string atau null jika disediakan.', 400);
  }

  return prisma.reminder.create({
    data: {
      userId,
      title: title.trim(),
      description: description ? description.trim() : null, // Pastikan tersimpan sebagai null jika kosong
      remindAt: new Date(remindAt),
    },
  });
};

export const updateReminder = async (
  reminderId: number,
  userId: number,
  userRole: string,
  title?: string,
  description?: string | null, // Bisa null
  remindAt?: string,
  isActive?: boolean
) => {
  if (isNaN(reminderId)) {
    throw new AppError('ID pengingat tidak valid.', 400);
  }

  const existingReminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
  });

  if (!existingReminder) {
    throw new AppError('Pengingat tidak ditemukan.', 404);
  }

  // Otorisasi
  if (userRole !== 'admin' && existingReminder.userId !== userId) {
    throw new AppError('Terlarang: Anda tidak memiliki akses ke pengingat ini.', 403);
  }

  const dataToUpdate: any = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new AppError('Judul harus berupa string yang tidak kosong.', 400);
    }
    dataToUpdate.title = title.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== 'string') {
      throw new AppError('Deskripsi harus berupa string atau null jika disediakan.', 400);
    }
    dataToUpdate.description = description ? description.trim() : null;
  }

  if (remindAt !== undefined) {
    if (!isValidISODateString(remindAt)) {
      throw new AppError('Format tanggal pengingat tidak valid.', 400);
    }
    dataToUpdate.remindAt = new Date(remindAt);
  }

  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive harus berupa boolean.', 400);
    }
    dataToUpdate.isActive = isActive;
  }

  return prisma.reminder.update({
    where: { id: reminderId },
    data: dataToUpdate,
  });
};

export const deleteReminder = async (reminderId: number, userId: number, userRole: string) => {
  if (isNaN(reminderId)) {
    throw new AppError('ID pengingat tidak valid.', 400);
  }

  const existingReminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
  });

  if (!existingReminder) {
    throw new AppError('Pengingat tidak ditemukan.', 404);
  }

  // Otorisasi
  if (userRole !== 'admin' && existingReminder.userId !== userId) {
    throw new AppError('Terlarang: Anda tidak memiliki akses ke pengingat ini.', 403);
  }

  await prisma.reminder.delete({ where: { id: reminderId } });
};

export const getReminderById = async (reminderId: number, userId: number, userRole: string) => {
  if (isNaN(reminderId)) {
    throw new AppError('ID pengingat tidak valid.', 400);
  }

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
  });

  if (!reminder) {
    throw new AppError('Pengingat tidak ditemukan.', 404);
  }

  // Otorisasi
  if (userRole !== 'admin' && reminder.userId !== userId) {
    throw new AppError('Terlarang: Anda tidak memiliki akses ke pengingat ini.', 403);
  }

  return reminder;
};