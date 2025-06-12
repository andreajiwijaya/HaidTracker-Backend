// src/services/symptomService.ts
import { prisma } from '../prisma';
import AppError from '../utils/AppError'; // Import AppError

const isValidDate = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

export const getSymptoms = async (userId: number) => {
  return prisma.symptom.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
};

export const getSymptomById = async (id: number) => {
  if (isNaN(id)) {
    throw new AppError('ID gejala tidak valid.', 400);
  }
  const symptom = await prisma.symptom.findUnique({ where: { id } });
  if (!symptom) {
    throw new AppError('Gejala tidak ditemukan.', 404);
  }
  return symptom;
};

export const createSymptom = async (userId: number, date: string, mood: string, symptoms: string) => {
  if (!date || !isValidDate(date)) {
    throw new AppError('Tanggal wajib diisi dan harus format tanggal valid (ISO).', 400);
  }
  if (!mood || typeof mood !== 'string' || mood.trim() === '') {
    throw new AppError('Suasana hati wajib diisi dan harus berupa string yang tidak kosong.', 400);
  }
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
    throw new AppError('Gejala wajib diisi dan harus berupa string yang tidak kosong.', 400);
  }

  return prisma.symptom.create({
    data: {
      userId,
      date: new Date(date),
      mood: mood.trim(),
      symptoms: symptoms.trim(),
    },
  });
};

export const updateSymptom = async (id: number, date?: string, mood?: string, symptoms?: string) => {
  if (isNaN(id)) {
    throw new AppError('ID gejala tidak valid.', 400);
  }

  const existing = await prisma.symptom.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Gejala tidak ditemukan.', 404);
  }

  const dataToUpdate: any = {};

  if (date !== undefined) {
    if (!isValidDate(date)) {
      throw new AppError('Tanggal harus format tanggal valid (ISO) jika disediakan.', 400);
    }
    dataToUpdate.date = new Date(date);
  }
  if (mood !== undefined) {
    if (typeof mood !== 'string' || mood.trim() === '') {
      throw new AppError('Suasana hati harus berupa string yang tidak kosong jika disediakan.', 400);
    }
    dataToUpdate.mood = mood.trim();
  }
  if (symptoms !== undefined) {
    if (typeof symptoms !== 'string' || symptoms.trim() === '') {
      throw new AppError('Gejala harus berupa string yang tidak kosong jika disediakan.', 400);
    }
    dataToUpdate.symptoms = symptoms.trim();
  }

  return prisma.symptom.update({
    where: { id },
    data: dataToUpdate,
  });
};

export const deleteSymptom = async (id: number) => {
  if (isNaN(id)) {
    throw new AppError('ID gejala tidak valid.', 400);
  }
  const existing = await prisma.symptom.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Gejala tidak ditemukan.', 404);
  }
  return prisma.symptom.delete({ where: { id } });
};