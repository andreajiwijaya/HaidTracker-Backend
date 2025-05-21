import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Helper validasi tanggal ISO sederhana
const isValidDate = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

export const getSymptoms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const symptoms = await prisma.symptom.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch symptoms' });
  }
};

export const getSymptomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).role;
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'Invalid symptom ID' });
      return;
    }

    const symptom = await prisma.symptom.findUnique({ where: { id: symptomId } });
    if (!symptom) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }

    if (userRole !== 'admin' && symptom.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to view this symptom' });
      return;
    }

    res.json(symptom);
  } catch {
    res.status(500).json({ error: 'Failed to fetch symptom' });
  }
};

export const createSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { date, mood, symptoms } = req.body;

    if (!date || !isValidDate(date)) {
      res.status(400).json({ error: 'Date is required and must be valid ISO date' });
      return;
    }
    if (!mood || typeof mood !== 'string') {
      res.status(400).json({ error: 'Mood is required and must be a string' });
      return;
    }
    if (!symptoms || typeof symptoms !== 'string') {
      res.status(400).json({ error: 'Symptoms are required and must be a string' });
      return;
    }

    const symptom = await prisma.symptom.create({
      data: {
        userId,
        date: new Date(date),
        mood,
        symptoms,
      },
    });

    res.status(201).json(symptom);
  } catch {
    res.status(500).json({ error: 'Failed to create symptom' });
  }
};

export const updateSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).role;
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'Invalid symptom ID' });
      return;
    }

    const existing = await prisma.symptom.findUnique({ where: { id: symptomId } });
    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }
    if (userRole !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this symptom' });
      return;
    }

    const { date, mood, symptoms } = req.body;

    if (date !== undefined && date !== null && !isValidDate(date)) {
      res.status(400).json({ error: 'Date must be a valid ISO date if provided' });
      return;
    }
    if (mood !== undefined && mood !== null && typeof mood !== 'string') {
      res.status(400).json({ error: 'Mood must be a string or null if provided' });
      return;
    }
    if (symptoms !== undefined && symptoms !== null && typeof symptoms !== 'string') {
      res.status(400).json({ error: 'Symptoms must be a string or null if provided' });
      return;
    }

    const updatedSymptom = await prisma.symptom.update({
      where: { id: symptomId },
      data: {
        date: date ? new Date(date) : existing.date,
        mood: mood ?? existing.mood,
        symptoms: symptoms ?? existing.symptoms,
      },
    });

    res.json(updatedSymptom);
  } catch {
    res.status(500).json({ error: 'Failed to update symptom' });
  }
};

export const deleteSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).role;
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'Invalid symptom ID' });
      return;
    }

    const existing = await prisma.symptom.findUnique({ where: { id: symptomId } });
    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }
    if (userRole !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this symptom' });
      return;
    }

    await prisma.symptom.delete({ where: { id: symptomId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete symptom' });
  }
};

// Endpoint 6: Get symptoms by userId (admin only)
export const getSymptomsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).role;
    if (userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const symptoms = await prisma.symptom.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    res.json(symptoms);
  } catch {
    res.status(500).json({ error: 'Failed to fetch symptoms by user' });
  }
};

// Endpoint 7: Get count of user's symptoms
export const getSymptomCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const count = await prisma.symptom.count({ where: { userId } });
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Failed to get symptom count' });
  }
};

// Endpoint 8: Get most recent symptom entry
export const getMostRecentSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const recent = await prisma.symptom.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    if (!recent) {
      res.status(404).json({ error: 'No symptoms found' });
      return;
    }
    res.json(recent);
  } catch {
    res.status(500).json({ error: 'Failed to get most recent symptom' });
  }
};

// Endpoint 9: Get symptoms with mood matching keyword (case-insensitive)
export const getSymptomsByMoodKeyword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { moodKeyword } = req.query;

    if (!moodKeyword || typeof moodKeyword !== 'string') {
      res.status(400).json({ error: 'moodKeyword query parameter is required and must be a string' });
      return;
    }

    const symptoms = await prisma.symptom.findMany({
      where: {
        userId,
        mood: { contains: moodKeyword, mode: 'insensitive' },
      },
      orderBy: { date: 'desc' },
    });

    res.json(symptoms);
  } catch {
    res.status(500).json({ error: 'Failed to fetch symptoms by mood keyword' });
  }
};

// Endpoint 10: Search symptoms by date range or symptoms keyword
export const searchSymptoms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, symptomKeyword } = req.query;

    const where: any = { userId };

    if (startDate && typeof startDate === 'string') {
      if (!isValidDate(startDate)) {
        res.status(400).json({ error: 'startDate must be a valid ISO date' });
        return;
      }
      where.date = { gte: new Date(startDate) };
    }

    if (endDate && typeof endDate === 'string') {
      if (!isValidDate(endDate)) {
        res.status(400).json({ error: 'endDate must be a valid ISO date' });
        return;
      }
      where.date = where.date
        ? { ...where.date, lte: new Date(endDate) }
        : { lte: new Date(endDate) };
    }

    if (symptomKeyword && typeof symptomKeyword === 'string') {
      where.symptoms = { contains: symptomKeyword, mode: 'insensitive' };
    }

    const symptoms = await prisma.symptom.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(symptoms);
  } catch {
    res.status(500).json({ error: 'Failed to search symptoms' });
  }
};
