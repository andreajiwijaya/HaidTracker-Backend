// src/middleware/authorizeMiddleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import AppError from '../utils/AppError';

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    console.log('DEBUG: authorizeMiddleware - Checking for role:', requiredRole, 'Current user role:', req.userRole);
    if (!req.userRole) {
      throw new AppError('Peran pengguna tidak ditemukan, tidak terotorisasi.', 401);
    }

    if (req.userRole !== requiredRole) {
      throw new AppError('Terlarang: hak akses tidak mencukupi.', 403);
    }

    next();
  };
};