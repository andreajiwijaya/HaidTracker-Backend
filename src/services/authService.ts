// src/services/authService.ts
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

interface AuthPayload {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export const registerUser = async ({ email, name, password, role }: AuthPayload) => {
  if (!email || !password) {
    throw { status: 400, message: 'Email and password are required' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const validRoles = ['user', 'admin'];
  const assignedRole = validRoles.includes(role || '') ? role : 'user';

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
    throw { status: 400, message: 'Email dan password wajib diisi' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw { status: 401, message: 'Email atau password salah' };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw { status: 401, message: 'Email atau password salah' };
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
