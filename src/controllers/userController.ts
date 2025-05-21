import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    include: { cycles: true },
  });
  res.json(users);
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
};
