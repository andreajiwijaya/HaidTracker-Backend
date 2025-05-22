import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Validasi ISO Date
const isValidISODateString = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

// 1. Admin: Get all analytics
export const getAllAnalyticsForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await prisma.analytic.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { periodStart: 'desc' }, // gunakan field yang ada
    });
    res.json(analytics);
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// 2. User: Get own analytics
export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const analytics = await prisma.analytic.findMany({
      where: { userId },
      orderBy: { periodStart: 'desc' },
    });
    res.json(analytics);
  } catch {
    res.status(500).json({ error: 'Failed to fetch your analytics' });
  }
};

// 3. Create analytic (user)
export const createAnalytic = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;

  if (!isValidISODateString(periodStart) || !isValidISODateString(periodEnd)) {
    res.status(400).json({ error: 'Valid periodStart and periodEnd are required' });
    return;
  }

  try {
    const analytic = await prisma.analytic.create({
      data: {
        userId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        averageCycle,
        symptomSummary,
      },
    });
    res.status(201).json(analytic);
  } catch {
    res.status(500).json({ error: 'Failed to create analytic' });
  }
};

// 4. Update analytic
export const updateAnalytic = async (req: Request, res: Response): Promise<void> => {
  try {
    const analyticId = Number(req.params.id);
    if (isNaN(analyticId)) {
      res.status(400).json({ error: 'Invalid analytic ID' });
      return;
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { periodStart, periodEnd, averageCycle, symptomSummary } = req.body;

    const existingAnalytic = await prisma.analytic.findUnique({
      where: { id: analyticId },
    });

    if (!existingAnalytic) {
      res.status(404).json({ error: 'Analytic not found' });
      return;
    }

    if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const dataToUpdate: any = {};

    if (periodStart && isValidISODateString(periodStart)) {
      dataToUpdate.periodStart = new Date(periodStart);
    }

    if (periodEnd && isValidISODateString(periodEnd)) {
      dataToUpdate.periodEnd = new Date(periodEnd);
    }

    if (averageCycle !== undefined) {
      dataToUpdate.averageCycle = averageCycle;
    }

    if (symptomSummary !== undefined) {
      dataToUpdate.symptomSummary = symptomSummary;
    }

    const updatedAnalytic = await prisma.analytic.update({
      where: { id: analyticId },
      data: dataToUpdate,
    });

    res.json(updatedAnalytic);
  } catch {
    res.status(500).json({ error: 'Failed to update analytic' });
  }
};

// 5. Delete analytic
export const deleteAnalytic = async (req: Request, res: Response): Promise<void> => {
  try {
    const analyticId = Number(req.params.id);
    if (isNaN(analyticId)) {
      res.status(400).json({ error: 'Invalid analytic ID' });
      return;
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const existingAnalytic = await prisma.analytic.findUnique({
      where: { id: analyticId },
    });

    if (!existingAnalytic) {
      res.status(404).json({ error: 'Analytic not found' });
      return;
    }

    if (userRole !== 'admin' && existingAnalytic.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.analytic.delete({ where: { id: analyticId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete analytic' });
  }
};

// 6. Get analytic by ID
export const getAnalyticById = async (req: Request, res: Response): Promise<void> => {
  try {
    const analyticId = Number(req.params.id);
    if (isNaN(analyticId)) {
      res.status(400).json({ error: 'Invalid analytic ID' });
      return;
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const analytic = await prisma.analytic.findUnique({
      where: { id: analyticId },
    });

    if (!analytic) {
      res.status(404).json({ error: 'Analytic not found' });
      return;
    }

    if (userRole !== 'admin' && analytic.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(analytic);
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytic' });
  }
};
