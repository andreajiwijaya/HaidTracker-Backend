// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError';

const JWT_SECRET = process.env.JWT_SECRET || 'tracker-haid-key-1';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
}

interface JwtPayload {
  userId: number;
  role: string;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Token akses tidak ada.', 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;
    req.userRole = payload.role;
    console.log('DEBUG: authMiddleware - User ID:', req.userId, 'Role:', req.userRole);
    next();
  } catch (error) {
    throw new AppError('Token tidak valid atau kedaluwarsa.', 403);
  }
};