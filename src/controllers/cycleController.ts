import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Helper: validasi tanggal ISO sederhana
const isValidDate = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

const parseUserId = (req: Request): number => {
  return (req as any).userId;
};

const parseUserRole = (req: Request): string => {
  return (req as any).role;
};

export const getCycles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseUserId(req);
    const role = parseUserRole(req);

    let cycles;
    if (role === 'admin') {
      // Admin dapat semua siklus
      cycles = await prisma.cycle.findMany({
        orderBy: { startDate: 'desc' },
      });
    } else {
      // User hanya siklus miliknya
      cycles = await prisma.cycle.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' },
      });
    }
    res.json(cycles);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cycles' });
  }
};

export const getCycleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseUserId(req);
    const role = parseUserRole(req);
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

    if (role !== 'admin' && cycle.userId !== userId) {
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
    const userId = parseUserId(req);
    const role = parseUserRole(req);
    const { startDate, endDate, note, userId: targetUserId } = req.body;

    // Validasi userId untuk admin (boleh buat siklus untuk user lain)
    let actualUserId = userId;
    if (role === 'admin' && typeof targetUserId === 'number') {
      actualUserId = targetUserId;
    }

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
        userId: actualUserId,
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
    const userId = parseUserId(req);
    const role = parseUserRole(req);
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

    if (role !== 'admin' && existing.userId !== userId) {
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
    const userId = parseUserId(req);
    const role = parseUserRole(req);
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

    if (role !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this cycle' });
      return;
    }

    await prisma.cycle.delete({ where: { id: cycleId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete cycle' });
  }
};

export const searchCycles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseUserId(req);
    const role = parseUserRole(req);
    const { noteKeyword, startDate } = req.query;

    const where: any = {};

    if (role === 'admin') {
      // Admin bisa cari semua siklus, filter opsional
    } else {
      // User hanya siklus miliknya
      where.userId = userId;
    }

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

// Hanya admin yang boleh akses
export const getCycleStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = parseUserRole(req);
    if (role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to access statistics' });
      return;
    }

    // Contoh: hitung jumlah siklus per user
    const stats = await prisma.cycle.groupBy({
      by: ['userId'],
      _count: { id: true },
    });

    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cycle statistics' });
  }
};
