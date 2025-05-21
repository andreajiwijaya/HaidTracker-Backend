import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';

// Validasi sederhana email
const isValidEmail = (email: any): boolean => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};

// Validasi password minimal (misal min 6 karakter)
const isValidPassword = (password: any): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

// 1. Get all users (admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: { cycles: true }, // include related cycles
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// 2. Get user by id (admin or self)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).role;
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    if (requesterRole !== 'admin' && requesterId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cycles: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// 3. Create user (open, no auth needed)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  if (!password || !isValidPassword(password)) {
    res.status(400).json({ error: 'Password of min 6 chars is required' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });
    res.status(201).json(user);
  } catch {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
};

// 4. Update user (admin or self)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).role;
    const userId = Number(req.params.id);
    const { email, name, password } = req.body;

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    if (requesterRole !== 'admin' && requesterId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const dataToUpdate: any = {};

    if (email) {
      if (!isValidEmail(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
      dataToUpdate.email = email;
    }

    if (name) {
      dataToUpdate.name = name;
    }

    if (password) {
      if (!isValidPassword(password)) {
        res.status(400).json({ error: 'Password of min 6 chars is required' });
        return;
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.json(updatedUser);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// 5. Delete user (admin or self)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).role;
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    if (requesterRole !== 'admin' && requesterId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// 6. Get user count (admin only)
export const getUserCount = async (_req: Request, res: Response): Promise<void> => {
  try {
    const count = await prisma.user.count();
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Failed to get user count' });
  }
};

// 7. Get users with pagination (admin only)
export const getUsersPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const users = await prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { cycles: true },
      orderBy: { id: 'asc' },
    });

    const totalCount = await prisma.user.count();

    res.json({
      page,
      pageSize,
      totalCount,
      users,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users paginated' });
  }
};

// 8. Search users by email or name (admin only)
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { cycles: true },
    });

    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// 9. Get user profile (self only)
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cycles: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// 10. Update user profile (self only)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { email, name, password } = req.body;

    const dataToUpdate: any = {};

    if (email) {
      if (!isValidEmail(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
      dataToUpdate.email = email;
    }

    if (name) {
      dataToUpdate.name = name;
    }

    if (password) {
      if (!isValidPassword(password)) {
        res.status(400).json({ error: 'Password of min 6 chars is required' });
        return;
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.json(updatedUser);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
