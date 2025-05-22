import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';

// Validasi email sederhana
const isValidEmail = (email: any): boolean => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};

// Validasi password minimal 6 karakter
const isValidPassword = (password: any): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

// Create user (only admin)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  // Pastikan req punya user info hasil authenticate
  const requesterRole = (req as any).role;
  if (requesterRole !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin only' });
    return;
  }

  const { email, name, password, role } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  if (!password || !isValidPassword(password)) {
    res.status(400).json({ error: 'Password of minimum 6 characters is required' });
    return;
  }
  if (role && !['user', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword, role: role || 'user' },
      select: { id: true, email: true, name: true, role: true }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Get user by id (admin or self)
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
      select: { id: true, email: true, name: true, role: true }
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

// Update user (admin or self)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).role;
    const userId = Number(req.params.id);
    const { email, name, password, role } = req.body;

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // User biasa hanya bisa update diri sendiri, admin bisa update siapa saja
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
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists && emailExists.id !== userId) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
      dataToUpdate.email = email;
    }

    if (name) {
      dataToUpdate.name = name;
    }

    if (password) {
      if (!isValidPassword(password)) {
        res.status(400).json({ error: 'Password of minimum 6 characters is required' });
        return;
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Hanya admin yang bisa update role
    if (role) {
      if (requesterRole !== 'admin') {
        res.status(403).json({ error: 'Only admin can update role' });
        return;
      }
      if (!['user', 'admin'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }
      dataToUpdate.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, name: true, role: true }
    });

    res.json(updatedUser);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user (admin or self)
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

// Get own profile (self only)
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
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

// Update own profile (self only)
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
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists && emailExists.id !== userId) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
      dataToUpdate.email = email;
    }

    if (name) {
      dataToUpdate.name = name;
    }

    if (password) {
      if (!isValidPassword(password)) {
        res.status(400).json({ error: 'Password of minimum 6 characters is required' });
        return;
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, name: true, role: true }
    });

    res.json(updatedUser);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
