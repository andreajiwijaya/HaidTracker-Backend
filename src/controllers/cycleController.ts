import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Helper: validasi tanggal ISO sederhana
const isValidDate = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

export const getCycles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const cycles = await prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cycles' });
  }
};

export const getCycleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).role;
    const cycleId = Number(req.params.id);
    if (isNaN(cycleId)) {
      res.status(400).json({ error: 'Invalid cycle ID' });
      return;
    }

    const cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!cycle) {
      res.status(404).json({ error: 'Cycle not found' });
      return;
    }

    if (userRole !== 'admin' && cycle.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to view this cycle' });
      return;
    }

    res.json(cycle);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cycle' });
  }
};

export const createCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, note } = req.body;

    if (!startDate || !isValidDate(startDate)) {
      res.status(400).json({ error: 'startDate is required and must be a valid date' });
      return;
    }
    if (endDate && !isValidDate(endDate)) {
      res.status(400).json({ error: 'endDate must be a valid date if provided' });
      return;
    }
    if (note && typeof note !== 'string') {
      res.status(400).json({ error: 'note must be a string if provided' });
      return;
    }

    const cycle = await prisma.cycle.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        note,
      },
    });

    res.status(201).json(cycle);
  } catch {
    res.status(500).json({ error: 'Failed to create cycle' });
  }
};

export const updateCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).role;
    const cycleId = Number(req.params.id);
    if (isNaN(cycleId)) {
      res.status(400).json({ error: 'Invalid cycle ID' });
      return;
    }

    const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing) {
      res.status(404).json({ error: 'Cycle not found' });
      return;
    }

    if (userRole !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this cycle' });
      return;
    }

    const { startDate, endDate, note } = req.body;

    if (startDate !== undefined && !isValidDate(startDate)) {
      res.status(400).json({ error: 'startDate must be a valid date if provided' });
      return;
    }
    if (endDate !== undefined && endDate !== null && !isValidDate(endDate)) {
      res.status(400).json({ error: 'endDate must be a valid date or null if provided' });
      return;
    }
    if (note !== undefined && typeof note !== 'string' && note !== null) {
      res.status(400).json({ error: 'note must be a string or null if provided' });
      return;
    }

    const updatedCycle = await prisma.cycle.update({
      where: { id: cycleId },
      data: {
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        note: note !== undefined ? note : existing.note,
      },
    });

    res.json(updatedCycle);
  } catch {
    res.status(500).json({ error: 'Failed to update cycle' });
  }
};

export const deleteCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).role;
    const cycleId = Number(req.params.id);
    if (isNaN(cycleId)) {
      res.status(400).json({ error: 'Invalid cycle ID' });
      return;
    }

    const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing) {
      res.status(404).json({ error: 'Cycle not found' });
      return;
    }

    if (userRole !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this cycle' });
      return;
    }

    await prisma.cycle.delete({ where: { id: cycleId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete cycle' });
  }
};

export const getCyclesByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).role;
    if (userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const cycles = await prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    res.json(cycles);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cycles by user' });
  }
};

export const getCycleCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const count = await prisma.cycle.count({ where: { userId } });

    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Failed to get cycle count' });
  }
};

export const getMostRecentCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const recentCycle = await prisma.cycle.findFirst({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    if (!recentCycle) {
      res.status(404).json({ error: 'No cycles found' });
      return;
    }

    res.json(recentCycle);
  } catch {
    res.status(500).json({ error: 'Failed to get most recent cycle' });
  }
};

export const getCyclesWithNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const cycles = await prisma.cycle.findMany({
      where: {
        userId,
        note: { not: null },
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(cycles);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cycles with notes' });
  }
};

export const searchCycles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { noteKeyword, startDate } = req.query;

    const where: any = { userId };

    if (noteKeyword && typeof noteKeyword === 'string') {
      where.note = { contains: noteKeyword, mode: 'insensitive' };
    }
    if (startDate && typeof startDate === 'string' && isValidDate(startDate)) {
      where.startDate = new Date(startDate);
    }

    const cycles = await prisma.cycle.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });

    res.json(cycles);
  } catch {
    res.status(500).json({ error: 'Failed to search cycles' });
  }
};
