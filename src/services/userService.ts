// src/services/userService.ts
import { Response } from 'express'; // Masih perlu Response untuk argumen fungsi
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import AppError from '../utils/AppError'; // Import AppError

const isValidEmail = (email: any): boolean => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};

const isValidPassword = (password: any): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

// Fungsi createUser di service tidak lagi mengambil `res`
export const createUser = async (userData: any, requesterRole: string) => {
  if (requesterRole !== 'admin') {
    throw new AppError('Terlarang: Hanya admin yang dapat membuat pengguna baru.', 403);
  }

  const { email, name, password, role } = userData;

  if (!email || !isValidEmail(email)) {
    throw new AppError('Email yang valid wajib diisi.', 400);
  }
  if (!password || !isValidPassword(password)) {
    throw new AppError('Password minimal 6 karakter wajib diisi.', 400);
  }
  if (role && !['user', 'admin'].includes(role)) {
    throw new AppError('Peran tidak valid.', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email sudah terdaftar.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword, role: role || 'user' },
    select: { id: true, email: true, name: true, role: true }
  });
  return user; // Kembalikan user
};

// Fungsi getUserById di service tidak lagi mengambil `res`
export const getUserById = async (userId: number, requesterId: number, requesterRole: string) => {
  if (isNaN(userId)) {
    throw new AppError('ID pengguna tidak valid.', 400);
  }

  if (requesterRole !== 'admin' && requesterId !== userId) {
    throw new AppError('Terlarang: Anda tidak memiliki akses ke pengguna ini.', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true }
  });

  if (!user) {
    throw new AppError('Pengguna tidak ditemukan.', 404);
  }
  return user; // Kembalikan user
};

// Fungsi updateUser di service tidak lagi mengambil `res`
export const updateUser = async (
  targetUserId: number,
  updateData: any, // data dari req.body
  requesterId: number,
  requesterRole: string
) => {
  if (isNaN(targetUserId)) {
    throw new AppError('ID pengguna tidak valid.', 400);
  }

  if (requesterRole !== 'admin' && requesterId !== targetUserId) {
    throw new AppError('Terlarang: Anda tidak memiliki akses untuk memperbarui pengguna ini.', 403);
  }

  const existingUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existingUser) {
    throw new AppError('Pengguna tidak ditemukan.', 404);
  }

  const dataToUpdate: any = {};

  if (updateData.email !== undefined) { // Cek jika email disediakan
    if (!isValidEmail(updateData.email)) {
      throw new AppError('Format email tidak valid.', 400);
    }
    const emailExists = await prisma.user.findUnique({ where: { email: updateData.email } });
    if (emailExists && emailExists.id !== targetUserId) {
      throw new AppError('Email sudah digunakan oleh pengguna lain.', 409);
    }
    dataToUpdate.email = updateData.email;
  }

  if (updateData.name !== undefined) {
    dataToUpdate.name = updateData.name;
  }

  if (updateData.password !== undefined) {
    if (!isValidPassword(updateData.password)) {
      throw new AppError('Password minimal 6 karakter wajib diisi.', 400);
    }
    dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
  }

  if (updateData.role !== undefined) {
    if (requesterRole !== 'admin') {
      throw new AppError('Hanya admin yang dapat memperbarui peran.', 403);
    }
    if (!['user', 'admin'].includes(updateData.role)) {
      throw new AppError('Peran tidak valid.', 400);
    }
    dataToUpdate.role = updateData.role;
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: dataToUpdate,
    select: { id: true, email: true, name: true, role: true }
  });
  return updatedUser; // Kembalikan user
};

// Fungsi deleteUser di service tidak lagi mengambil `res`
export const deleteUser = async (targetUserId: number, requesterId: number, requesterRole: string) => {
  if (isNaN(targetUserId)) {
    throw new AppError('ID pengguna tidak valid.', 400);
  }

  if (requesterRole !== 'admin' && requesterId !== targetUserId) {
    throw new AppError('Terlarang: Anda tidak memiliki akses untuk menghapus pengguna ini.', 403);
  }

  const existingUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existingUser) {
    throw new AppError('Pengguna tidak ditemukan.', 404);
  }

  // Jika admin menghapus dirinya sendiri
  if (requesterRole === 'admin' && requesterId === targetUserId) {
      // Pertimbangkan apakah admin boleh menghapus dirinya sendiri.
      // Untuk aplikasi sederhana, mungkin boleh. Untuk produksi, perlu logic khusus.
      // Contoh: throw new AppError('Admin tidak bisa menghapus akunnya sendiri.', 403);
  }


  await prisma.user.delete({ where: { id: targetUserId } });
  return; // Tidak mengembalikan apa-apa untuk 204 No Content
};

// Fungsi getProfile di service tidak lagi mengambil `res`
export const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true }
  });

  if (!user) {
    throw new AppError('Profil pengguna tidak ditemukan.', 404);
  }
  return user; // Kembalikan user
};

// Fungsi updateProfile di service tidak lagi mengambil `res`
export const updateProfile = async (userId: number, updateData: any) => {
  const dataToUpdate: any = {};

  if (updateData.email !== undefined) {
    if (!isValidEmail(updateData.email)) {
      throw new AppError('Format email tidak valid.', 400);
    }
    const emailExists = await prisma.user.findUnique({ where: { email: updateData.email } });
    if (emailExists && emailExists.id !== userId) {
      throw new AppError('Email sudah digunakan oleh pengguna lain.', 409);
    }
    dataToUpdate.email = updateData.email;
  }

  if (updateData.name !== undefined) {
    dataToUpdate.name = updateData.name;
  }

  if (updateData.password !== undefined) {
    if (!isValidPassword(updateData.password)) {
      throw new AppError('Password minimal 6 karakter wajib diisi.', 400);
    }
    dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: { id: true, email: true, name: true, role: true }
  });
  return updatedUser; // Kembalikan user
};

// Get all users (admin only)
export const getAllUsers = async (requesterRole: string) => {
  if (requesterRole !== 'admin') {
    throw new AppError('Terlarang: Hanya admin yang dapat melihat daftar pengguna.', 403);
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { id: 'asc' }
  });

  return users;
};
