import { prisma } from '../prisma';

const isValidISODateString = (dateStr: any): boolean => {
  return typeof dateStr === 'string' && !isNaN(Date.parse(dateStr));
};

export const getAllRemindersForAdmin = async () => {
  return prisma.reminder.findMany({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { remindAt: 'asc' },
  });
};

export const getUserReminders = async (userId: number) => {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { remindAt: 'asc' },
  });
};

export const createReminder = async (
  userId: number,
  title: any,
  description: any,
  remindAt: any
) => {
  if (!title || typeof title !== 'string') {
    throw { status: 400, message: 'Title is required and must be a string' };
  }

  if (!remindAt || !isValidISODateString(remindAt)) {
    throw { status: 400, message: 'Valid remindAt (ISO format) is required' };
  }

  return prisma.reminder.create({
    data: {
      userId,
      title,
      description,
      remindAt: new Date(remindAt),
    },
  });
};

export const updateReminder = async (
  reminderId: number,
  userId: number,
  userRole: string,
  title?: any,
  description?: any,
  remindAt?: any,
  isActive?: any
) => {
  if (isNaN(reminderId)) {
    throw { status: 400, message: 'Invalid reminder ID' };
  }

  const existingReminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
  });

  if (!existingReminder) {
    throw { status: 404, message: 'Reminder not found' };
  }

  if (userRole !== 'admin' && existingReminder.userId !== userId) {
    throw { status: 403, message: 'Forbidden' };
  }

  const dataToUpdate: any = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw { status: 400, message: 'Title must be a non-empty string' };
    }
    dataToUpdate.title = title;
  }

  if (description !== undefined) {
    dataToUpdate.description = description;
  }

  if (remindAt !== undefined) {
    if (!isValidISODateString(remindAt)) {
      throw { status: 400, message: 'Invalid remindAt format' };
    }
    dataToUpdate.remindAt = new Date(remindAt);
  }

  if (isActive !== undefined) {
    dataToUpdate.isActive = Boolean(isActive);
  }

  return prisma.reminder.update({
    where: { id: reminderId },
    data: dataToUpdate,
  });
};

export const deleteReminder = async (reminderId: number, userId: number, userRole: string) => {
  if (isNaN(reminderId)) {
    throw { status: 400, message: 'Invalid reminder ID' };
  }

  const existingReminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
  });

  if (!existingReminder) {
    throw { status: 404, message: 'Reminder not found' };
  }

  if (userRole !== 'admin' && existingReminder.userId !== userId) {
    throw { status: 403, message: 'Forbidden' };
  }

  await prisma.reminder.delete({ where: { id: reminderId } });
};

export const getReminderById = async (reminderId: number, userId: number, userRole: string) => {
  if (isNaN(reminderId)) {
    throw { status: 400, message: 'Invalid reminder ID' };
  }

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
  });

  if (!reminder) {
    throw { status: 404, message: 'Reminder not found' };
  }

  if (userRole !== 'admin' && reminder.userId !== userId) {
    throw { status: 403, message: 'Forbidden' };
  }

  return reminder;
};
