// src/middleware/authorizeMiddleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'User role not found, unauthorized' });
      return;
    }

    if (req.userRole !== requiredRole) {
      res.status(403).json({ error: 'Forbidden: insufficient rights' });
      return;
    }

    next();
  };
};
