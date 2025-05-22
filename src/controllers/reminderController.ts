import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Helper validasi ISO date
const isValidISODateString = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

// 1. Get all reminders for admin
export const getAllRemindersForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminders = await prisma.reminder.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { remindAt: 'asc' },
    });
    res.json(reminders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reminders for admin' });
  }
};

// 2. Get reminders for logged-in user
export const getUserReminders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { remindAt: 'asc' },
    });
    res.json(reminders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};

// 3. Create reminder
export const createReminder = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { title, description, remindAt } = req.body;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Title is required and must be a string' });
    return;
  }

  if (!remindAt || !isValidISODateString(remindAt)) {
    res.status(400).json({ error: 'Valid remindAt (ISO format) is required' });
    return;
  }

  try {
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        title,
        description,
        remindAt: new Date(remindAt),
      },
    });
    res.status(201).json(reminder);
  } catch {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
};

// 4. Update reminder
export const updateReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    if (isNaN(reminderId)) {
      res.status(400).json({ error: 'Invalid reminder ID' });
      return;
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { title, description, remindAt, isActive } = req.body;

    const existingReminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!existingReminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    if (userRole !== 'admin' && existingReminder.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const dataToUpdate: any = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({ error: 'Title must be a non-empty string' });
        return;
      }
      dataToUpdate.title = title;
    }

    if (description !== undefined) {
      dataToUpdate.description = description;
    }

    if (remindAt !== undefined) {
      if (!isValidISODateString(remindAt)) {
        res.status(400).json({ error: 'Invalid remindAt format' });
        return;
      }
      dataToUpdate.remindAt = new Date(remindAt);
    }

    if (isActive !== undefined) {
      dataToUpdate.isActive = Boolean(isActive);
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: dataToUpdate,
    });

    res.json(updatedReminder);
  } catch {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
};

// 5. Delete reminder
export const deleteReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    if (isNaN(reminderId)) {
      res.status(400).json({ error: 'Invalid reminder ID' });
      return;
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const existingReminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!existingReminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    if (userRole !== 'admin' && existingReminder.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.reminder.delete({ where: { id: reminderId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
};

// 6. Get reminder by ID
export const getReminderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    if (isNaN(reminderId)) {
      res.status(400).json({ error: 'Invalid reminder ID' });
      return;
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    if (userRole !== 'admin' && reminder.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(reminder);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reminder' });
  }
};
