// src/controllers/reminderController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Import AuthenticatedRequest
import * as reminderService from '../services/reminderService';
import AppError from '../utils/AppError'; // Import AppError

// 1. Get all reminders for admin
export const getAllRemindersForAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Middleware authorizeRole sudah mengurus otorisasi admin
    const reminders = await reminderService.getAllRemindersForAdmin();
    res.json(reminders);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil semua pengingat untuk admin.' });
    }
  }
};

// 2. Get reminders for logged-in user
export const getUserReminders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const reminders = await reminderService.getUserReminders(userId);
    res.json(reminders);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil pengingat Anda.' });
    }
  }
};

// 3. Create reminder
export const createReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { title, description, remindAt } = req.body;

    const reminder = await reminderService.createReminder(userId, title, description, remindAt);
    res.status(201).json(reminder);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal membuat pengingat.' });
    }
  }
};

// 4. Update reminder
export const updateReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    // Perbaikan: Validasi ID di controller
    if (isNaN(reminderId)) {
      res.status(400).json({ error: 'ID pengingat tidak valid.' });
      return;
    }

    const userId = req.userId!;
    const userRole = req.userRole!;
    const { title, description, remindAt, isActive } = req.body;

    const updatedReminder = await reminderService.updateReminder(
      reminderId, userId, userRole, title, description, remindAt, isActive
    );

    res.json(updatedReminder);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui pengingat.' });
    }
  }
};

// 5. Delete reminder
export const deleteReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    // Perbaikan: Validasi ID di controller
    if (isNaN(reminderId)) {
      res.status(400).json({ error: 'ID pengingat tidak valid.' });
      return;
    }

    const userId = req.userId!;
    const userRole = req.userRole!;

    await reminderService.deleteReminder(reminderId, userId, userRole);
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal menghapus pengingat.' });
    }
  }
};

// 6. Get reminder by ID
export const getReminderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    // Perbaikan: Validasi ID di controller
    if (isNaN(reminderId)) {
      res.status(400).json({ error: 'ID pengingat tidak valid.' });
      return;
    }

    const userId = req.userId!;
    const userRole = req.userRole!;

    const reminder = await reminderService.getReminderById(reminderId, userId, userRole);
    res.json(reminder);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil detail pengingat.' });
    }
  }
};