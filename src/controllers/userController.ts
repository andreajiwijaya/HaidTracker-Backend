import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as userService from '../services/userService';
import AppError from '../utils/AppError';

// Create user (only admin)
export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await userService.createUser(req.body, req.userRole!);
    res.status(201).json(user);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal membuat pengguna baru.' });
    }
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers(req.userRole!);
    res.json(users);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil daftar pengguna.' });
    }
  }
};

// Get user by id (admin or self)
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID pengguna tidak valid.' });
      return;
    }
    const user = await userService.getUserById(userId, req.userId!, req.userRole!);
    res.json(user);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil detail pengguna.' });
    }
  }
};

// Update user (admin or self)
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = Number(req.params.id);
    if (isNaN(targetUserId)) {
      res.status(400).json({ error: 'ID pengguna tidak valid.' });
      return;
    }
    const updatedUser = await userService.updateUser(targetUserId, req.body, req.userId!, req.userRole!);
    res.json(updatedUser);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui pengguna.' });
    }
  }
};

// Delete user (admin or self)
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = Number(req.params.id);
    if (isNaN(targetUserId)) {
      res.status(400).json({ error: 'ID pengguna tidak valid.' });
      return;
    }
    await userService.deleteUser(targetUserId, req.userId!, req.userRole!);
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal menghapus pengguna.' });
    }
  }
};

// Get own profile (self only)
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await userService.getProfile(req.userId!);
    res.json(user);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal mengambil profil.' });
    }
  }
};

// Update own profile (self only)
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updatedUser = await userService.updateProfile(req.userId!, req.body);
    res.json(updatedUser);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui profil.' });
    }
  }
};
