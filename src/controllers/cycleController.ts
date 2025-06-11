import { Request, Response } from 'express';
import * as cycleService from '../services/cycleService';

const isValidDate = (dateStr: any): boolean =>
  typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));

const parseUserId = (req: Request): number => (req as any).userId;
const parseUserRole = (req: Request): string => (req as any).role;

export const getCycles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseUserId(req);
    const role = parseUserRole(req);
    const cycles = await cycleService.getAllCycles(userId, role);
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

    const cycle = await cycleService.getCycle(cycleId);
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

    const cycle = await cycleService.createCycleEntry(userId, role, {
      startDate,
      endDate,
      note,
      targetUserId,
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

    const existing = await cycleService.getCycle(cycleId);
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

    const updated = await cycleService.updateCycleEntry(cycleId, { startDate, endDate, note });
    res.json(updated);
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

    const existing = await cycleService.getCycle(cycleId);
    if (!existing) {
      res.status(404).json({ error: 'Cycle not found' });
      return;
    }

    if (role !== 'admin' && existing.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this cycle' });
      return;
    }

    await cycleService.deleteCycleEntry(cycleId);
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

    const cycles = await cycleService.searchUserCycles(userId, role, {
      noteKeyword: noteKeyword as string,
      startDate: startDate as string,
    });

    res.json(cycles);
  } catch {
    res.status(500).json({ error: 'Failed to search cycles' });
  }
};

export const getCycleStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = parseUserRole(req);
    if (role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to access statistics' });
      return;
    }

    const stats = await cycleService.getCycleStatistics();
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cycle statistics' });
  }
};
