// src/controllers/symptomController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Import AuthenticatedRequest
import * as symptomService from '../services/symptomService';
import AppError from '../utils/AppError'; // Import AppError

export const getSymptoms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const symptoms = await symptomService.getSymptoms(userId);
    res.json(symptoms);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil daftar gejala.' });
    }
  }
};

export const getSymptomById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'ID gejala tidak valid.' });
      return;
    }

    const { userId, userRole } = req; // Gunakan langsung dari req
    const symptom = await symptomService.getSymptomById(symptomId); // Service akan melempar error jika tidak ditemukan

    if (userRole !== 'admin' && symptom.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke gejala ini.' });
      return;
    }

    res.json(symptom);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil detail gejala.' });
    }
  }
};

export const createSymptom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { date, mood, symptoms } = req.body;

    const newSymptom = await symptomService.createSymptom(userId, date, mood, symptoms);
    res.status(201).json(newSymptom);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal membuat gejala baru.' });
    }
  }
};

export const updateSymptom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'ID gejala tidak valid.' });
      return;
    }

    const { userId, userRole } = req;
    const existing = await symptomService.getSymptomById(symptomId); // Ini akan melempar AppError jika tidak ditemukan

    if (userRole !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk memperbarui gejala ini.' });
      return;
    }

    const { date, mood, symptoms } = req.body;
    const updated = await symptomService.updateSymptom(symptomId, date, mood, symptoms);
    res.json(updated);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui gejala.' });
    }
  }
};

export const deleteSymptom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const symptomId = Number(req.params.id);
    if (isNaN(symptomId)) {
      res.status(400).json({ error: 'ID gejala tidak valid.' });
      return;
    }

    const { userId, userRole } = req;
    const existing = await symptomService.getSymptomById(symptomId); // Ini akan melempar AppError jika tidak ditemukan

    if (userRole !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk menghapus gejala ini.' });
      return;
    }

    await symptomService.deleteSymptom(symptomId);
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal menghapus gejala.' });
    }
  }
};

export const getSymptomsByUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.userRole!;
    // Middleware authorizeRole sudah mengurus ini, tapi validasi di controller/service juga bisa
    if (userRole !== 'admin') {
      res.status(403).json({ error: 'Terlarang.' });
      return;
    }

    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID pengguna tidak valid.' });
      return;
    }

    const symptoms = await symptomService.getSymptoms(userId);
    res.json(symptoms);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil gejala berdasarkan pengguna.' });
    }
  }
};