import { prisma } from '../prisma';

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
  return prisma.symptom.findUnique({ where: { id } });
};

export const createSymptom = async (userId: number, date: any, mood: any, symptoms: any) => {
  if (!date || !isValidDate(date)) {
    throw new Error('Date is required and must be valid ISO date');
  }
  if (!mood || typeof mood !== 'string' || mood.trim() === '') {
    throw new Error('Mood is required and must be a non-empty string');
  }
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
    throw new Error('Symptoms are required and must be a non-empty string');
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

export const updateSymptom = async (id: number, date?: any, mood?: any, symptoms?: any) => {
  if (date !== undefined && date !== null && !isValidDate(date)) {
    throw new Error('Date must be a valid ISO date if provided');
  }
  if (mood !== undefined && mood !== null && (typeof mood !== 'string' || mood.trim() === '')) {
    throw new Error('Mood must be a non-empty string if provided');
  }
  if (symptoms !== undefined && symptoms !== null && (typeof symptoms !== 'string' || symptoms.trim() === '')) {
    throw new Error('Symptoms must be a non-empty string if provided');
  }

  const existing = await prisma.symptom.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.symptom.update({
    where: { id },
    data: {
      date: date ? new Date(date) : existing.date,
      mood: mood ? mood.trim() : existing.mood,
      symptoms: symptoms ? symptoms.trim() : existing.symptoms,
    },
  });
};

export const deleteSymptom = async (id: number) => {
  return prisma.symptom.delete({ where: { id } });
};
