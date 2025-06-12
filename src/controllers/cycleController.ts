// src/controllers/cycleController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Import AuthenticatedRequest
import * as cycleService from '../services/cycleService';
import AppError from '../utils/AppError'; // Import AppError

// Helper untuk validasi tanggal (dapat dipindah ke utils/validation.ts jika sering dipakai)
const isValidDate = (dateStr: any): boolean =>
  typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));

export const getCycles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const role = req.userRole!;
    const cycles = await cycleService.getAllCycles(userId, role);
    res.json(cycles);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil daftar siklus.' });
    }
  }
};

export const getCycleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const role = req.userRole!;
    const cycleId = Number(req.params.id);

    // Validasi dasar ID bisa tetap di controller
    if (isNaN(cycleId)) {
      res.status(400).json({ error: 'ID siklus tidak valid.' });
      return;
    }

    // Perbaikan: Memanggil service yang sudah melempar AppError
    const cycle = await cycleService.getCycle(cycleId); // Service akan menangani not found

    if (role !== 'admin' && cycle.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke siklus ini.' });
      return;
    }

    res.json(cycle);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil detail siklus.' });
    }
  }
};

export const createCycle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const role = req.userRole!;
    const { startDate, endDate, note, userId: targetUserId } = req.body;

    // Perbaikan: Validasi dipindahkan ke service, controller hanya memanggil dan menangkap error
    const cycle = await cycleService.createCycleEntry(userId, role, {
      startDate,
      endDate,
      note,
      targetUserId,
    });

    res.status(201).json(cycle);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal membuat siklus baru.' });
    }
  }
};

export const updateCycle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const role = req.userRole!;
    const cycleId = Number(req.params.id);

    if (isNaN(cycleId)) {
      res.status(400).json({ error: 'ID siklus tidak valid.' });
      return;
    }

    // Perbaikan: Ambil siklus dulu untuk otorisasi
    const existing = await cycleService.getCycle(cycleId); // Ini akan melempar AppError jika tidak ditemukan

    if (role !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk memperbarui siklus ini.' });
      return;
    }

    const { startDate, endDate, note } = req.body;

    const updated = await cycleService.updateCycleEntry(cycleId, { startDate, endDate, note });
    res.json(updated);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui siklus.' });
    }
  }
};

export const deleteCycle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const role = req.userRole!;
    const cycleId = Number(req.params.id);

    if (isNaN(cycleId)) {
      res.status(400).json({ error: 'ID siklus tidak valid.' });
      return;
    }

    // Perbaikan: Ambil siklus dulu untuk otorisasi
    const existing = await cycleService.getCycle(cycleId); // Ini akan melempar AppError jika tidak ditemukan

    if (role !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses untuk menghapus siklus ini.' });
      return;
    }

    await cycleService.deleteCycleEntry(cycleId);
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal menghapus siklus.' });
    }
  }
};

export const searchCycles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const role = req.userRole!;
    const { noteKeyword, startDate } = req.query;

    const cycles = await cycleService.searchUserCycles(userId, role, {
      noteKeyword: noteKeyword as string,
      startDate: startDate as string,
    });

    res.json(cycles);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mencari siklus.' });
    }
  }
};

export const getCycleStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log('DEBUG: cycleController/getCycleStats - User ID:', req.userId, 'Role:', req.userRole);
  try {
    const role = req.userRole!;
    // Middleware authorizeRole sudah mengurus ini, tapi validasi di controller/service juga bisa
    if (role !== 'admin') {
      res.status(403).json({ error: 'Terlarang: Anda tidak memiliki akses ke statistik.' });
      return;
    }

    const stats = await cycleService.getCycleStatistics();
    res.json(stats);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil statistik siklus.' });
    }
  }
};