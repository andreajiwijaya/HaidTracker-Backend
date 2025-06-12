// src/controllers/analyticController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Import AuthenticatedRequest
import * as analyticService from '../services/analyticService';
import AppError from '../utils/AppError'; // Import AppError

// Helper untuk validasi tanggal (bisa juga di utils/validation.ts)
const isValidISODateString = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

// 1. Admin: Get all analytics
export const getAllAnalyticsForAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Middleware authorizeRole sudah mengurus otorisasi admin
    const analytics = await analyticService.getAllAnalytics();
    res.json(analytics);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil semua analitik untuk admin.' });
    }
  }
};

// 2. User: Get own analytics
export const getUserAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const analytics = await analyticService.getAnalyticsByUserId(userId);
    res.json(analytics);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil analitik Anda.' });
    }
  }
};

// 3. Create analytic (user)
export const createAnalytic = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;

  try {
    // Validasi dasar tetap di controller
    if (!isValidISODateString(periodStart) || !isValidISODateString(periodEnd)) {
      res.status(400).json({ error: 'Tanggal mulai dan akhir periode wajib diisi dan harus valid.' });
      return;
    }

    const analytic = await analyticService.createAnalyticForUser(userId, {
      periodStart,
      periodEnd,
      averageCycle,
      symptomSummary,
    });
    res.status(201).json(analytic);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal membuat analitik.' });
    }
  }
};

// 4. Update analytic
export const updateAnalytic = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const analyticId = Number(req.params.id);
    if (isNaN(analyticId)) {
      res.status(400).json({ error: 'ID analitik tidak valid.' });
      return;
    }

    const userId = req.userId!;
    const userRole = req.userRole!;
    const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;

    // Perbaikan: Ambil analitik dulu untuk otorisasi
    const existingAnalytic = await analyticService.getAnalyticById(analyticId); // Ini akan melempar AppError jika tidak ditemukan

    if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk memperbarui analitik ini.' });
      return;
    }

    const dataToUpdate: any = {};
    if (periodStart !== undefined) {
      if (!isValidISODateString(periodStart)) {
        res.status(400).json({ error: 'Tanggal mulai periode harus valid jika disediakan.' });
        return;
      }
      dataToUpdate.periodStart = periodStart; // Dikirim sebagai string, konversi di service
    }
    if (periodEnd !== undefined) {
      if (!isValidISODateString(periodEnd)) {
        res.status(400).json({ error: 'Tanggal akhir periode harus valid jika disediakan.' });
        return;
      }
      dataToUpdate.periodEnd = periodEnd; // Dikirim sebagai string, konversi di service
    }
    if (averageCycle !== undefined) {
      dataToUpdate.averageCycle = averageCycle;
    }
    if (symptomSummary !== undefined) {
      dataToUpdate.symptomSummary = symptomSummary;
    }

    const updatedAnalytic = await analyticService.updateAnalyticById(analyticId, dataToUpdate);
    res.json(updatedAnalytic);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui analitik.' });
    }
  }
};

// 5. Delete analytic
export const deleteAnalytic = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const analyticId = Number(req.params.id);
    if (isNaN(analyticId)) {
      res.status(400).json({ error: 'ID analitik tidak valid.' });
      return;
    }

    const userId = req.userId!;
    const userRole = req.userRole!;

    const existingAnalytic = await analyticService.getAnalyticById(analyticId); // Ini akan melempar AppError jika tidak ditemukan

    if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk menghapus analitik ini.' });
      return;
    }

    await analyticService.deleteAnalyticById(analyticId);
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal menghapus analitik.' });
    }
  }
};

// 6. Get analytic by ID
export const getAnalyticById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const analyticId = Number(req.params.id);
    if (isNaN(analyticId)) {
      res.status(400).json({ error: 'ID analitik tidak valid.' });
      return;
    }

    const userId = req.userId!;
    const userRole = req.userRole!;

    const analytic = await analyticService.getAnalyticById(analyticId); // Ini akan melempar AppError jika tidak ditemukan

    if (userRole !== 'admin' && analytic.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke analitik ini.' });
      return;
    }

    res.json(analytic);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil detail analitik.' });
    }
  }
};