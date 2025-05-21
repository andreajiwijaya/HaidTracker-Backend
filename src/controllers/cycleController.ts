import { Request, Response } from 'express';
import { prisma } from '../prisma';

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

export const createCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, note } = req.body;

    if (!startDate) {
      res.status(400).json({ error: 'startDate is required' });
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
  } catch (error) {
    res.status(400).json({ error: 'Invalid cycle data' });
  }
};

export const updateCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const cycleId = Number(req.params.id);
    const { startDate, endDate, note } = req.body;

    const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Cycle not found or unauthorized' });
      return;
    }

    const updatedCycle = await prisma.cycle.update({
      where: { id: cycleId },
      data: {
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        note: note ?? existing.note,
      },
    });

    res.json(updatedCycle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cycle' });
  }
};

export const deleteCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const cycleId = Number(req.params.id);

    const existing = await prisma.cycle.findUnique({ where: { id: cycleId } });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Cycle not found or unauthorized' });
      return;
    }

    await prisma.cycle.delete({ where: { id: cycleId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete cycle' });
  }
};
