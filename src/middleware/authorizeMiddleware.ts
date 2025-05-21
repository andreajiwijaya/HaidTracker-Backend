import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).userRole;

    if (!userRole) {
      res.status(401).json({ error: 'User role not found, unauthorized' });
      return;
    }

    if (userRole !== requiredRole) {
      res.status(403).json({ error: 'Forbidden: insufficient rights' });
      return;
    }

    next();
  };
};
