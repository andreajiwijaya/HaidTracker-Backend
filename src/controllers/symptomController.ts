import { Request, Response } from 'express';
import * as symptomService from '../services/symptomService';

export const getSymptoms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const symptoms = await symptomService.getSymptoms(userId);
    res.json(symptoms);
  } catch {
    res.status(500).json({ error: 'Failed to fetch symptoms' });
  }
};

export const getSymptomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'Invalid symptom ID' });
      return;
    }

    const { userId, role } = req as any;
    const symptom = await symptomService.getSymptomById(symptomId);

    if (!symptom) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }

    if (role !== 'admin' && symptom.userId !== userId) {
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

    const newSymptom = await symptomService.createSymptom(userId, date, mood, symptoms);
    res.status(201).json(newSymptom);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'Invalid symptom ID' });
      return;
    }

    const { userId, role } = req as any;
    const existing = await symptomService.getSymptomById(symptomId);

    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }

    if (role !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this symptom' });
      return;
    }

    const { date, mood, symptoms } = req.body;
    const updated = await symptomService.updateSymptom(symptomId, date, mood, symptoms);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update symptom' });
  }
};

export const deleteSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'Invalid symptom ID' });
      return;
    }

    const { userId, role } = req as any;
    const existing = await symptomService.getSymptomById(symptomId);

    if (!existing) {
      res.status(404).json({ error: 'Symptom not found' });
      return;
    }

    if (role !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this symptom' });
      return;
    }

    await symptomService.deleteSymptom(symptomId);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete symptom' });
  }
};

export const getSymptomsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req as any).role;
    if (role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const symptoms = await symptomService.getSymptoms(userId);
    res.json(symptoms);
  } catch {
    res.status(500).json({ error: 'Failed to fetch symptoms by user' });
  }
};
