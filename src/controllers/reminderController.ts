import { Request, Response } from 'express';
import * as reminderService from '../services/reminderService';

// 1. Get all reminders for admin
export const getAllRemindersForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminders = await reminderService.getAllRemindersForAdmin();
    res.json(reminders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reminders for admin' });
  }
};

// 2. Get reminders for logged-in user
export const getUserReminders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const reminders = await reminderService.getUserReminders(userId);
    res.json(reminders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};

// 3. Create reminder
export const createReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { title, description, remindAt } = req.body;
    const reminder = await reminderService.createReminder(userId, title, description, remindAt);
    res.status(201).json(reminder);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to create reminder' });
  }
};

// 4. Update reminder
export const updateReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { title, description, remindAt, isActive } = req.body;

    const updatedReminder = await reminderService.updateReminder(
      reminderId, userId, userRole, title, description, remindAt, isActive
    );

    res.json(updatedReminder);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to update reminder' });
  }
};

// 5. Delete reminder
export const deleteReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    await reminderService.deleteReminder(reminderId, userId, userRole);
    res.status(204).send();
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to delete reminder' });
  }
};

// 6. Get reminder by ID
export const getReminderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reminderId = Number(req.params.id);
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const reminder = await reminderService.getReminderById(reminderId, userId, userRole);
    res.json(reminder);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch reminder' });
  }
};
