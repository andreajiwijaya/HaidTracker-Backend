import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Get all symptoms for the logged-in user
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

// Create a new symptom entry
export const createSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { date, mood, symptoms } = req.body;

    if (!date || !mood || !symptoms) {
      res.status(400).json({ error: 'Date, mood, and symptoms are required' });
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to create symptom' });
  }
};

// Update symptom by id
export const updateSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const symptomId = Number(req.params.id);
    const { date, mood, symptoms } = req.body;

    const existing = await prisma.symptom.findUnique({ where: { id: symptomId } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Symptom not found or unauthorized' });
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to update symptom' });
  }
};

// Delete symptom by id
export const deleteSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const symptomId = Number(req.params.id);

    const existing = await prisma.symptom.findUnique({ where: { id: symptomId } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Symptom not found or unauthorized' });
      return;
    }

    await prisma.symptom.delete({ where: { id: symptomId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete symptom' });
  }
};
