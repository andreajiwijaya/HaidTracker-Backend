// src/controllers/authController.ts
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import AppError from '../utils/AppError'; // Import AppError

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    // Perbaikan: Tangani AppError secara spesifik
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan server saat pendaftaran.' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    // Perbaikan: Tangani AppError secara spesifik
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan server saat login.' });
    }
  }
};