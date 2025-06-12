// src/services/authService.ts
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError'; // Import AppError

const JWT_SECRET = process.env.JWT_SECRET || 'tracker-haid-key-1'; // Pastikan ini diatur di .env!

interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export const registerUser = async ({ email, name, password, role }: AuthPayload) => {
  if (!email || !password) {
    throw new AppError('Email dan password wajib diisi.', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Pengguna dengan email ini sudah terdaftar.', 409); // 409 Conflict
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const validRoles = ['user', 'admin'];
  const assignedRole = (role && validRoles.includes(role)) ? role : 'user';

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: assignedRole,
    },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

export const loginUser = async ({ email, password }: AuthPayload) => {
  if (!email || !password) {
    throw new AppError('Email dan password wajib diisi.', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new AppError('Email atau password salah.', 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Email atau password salah.', 401);
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};