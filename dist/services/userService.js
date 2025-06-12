"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateProfile = exports.getProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = void 0;
const prisma_1 = require("../prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
const isValidEmail = (email) => {
    return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};
const isValidPassword = (password) => {
    return typeof password === 'string' && password.length >= 6;
};
// Fungsi createUser di service tidak lagi mengambil `res`
const createUser = async (userData, requesterRole) => {
    if (requesterRole !== 'admin') {
        throw new AppError_1.default('Terlarang: Hanya admin yang dapat membuat pengguna baru.', 403);
    }
    const { email, name, password, role } = userData;
    if (!email || !isValidEmail(email)) {
        throw new AppError_1.default('Email yang valid wajib diisi.', 400);
    }
    if (!password || !isValidPassword(password)) {
        throw new AppError_1.default('Password minimal 6 karakter wajib diisi.', 400);
    }
    if (role && !['user', 'admin'].includes(role)) {
        throw new AppError_1.default('Peran tidak valid.', 400);
    }
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError_1.default('Email sudah terdaftar.', 409);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: { email, name, password: hashedPassword, role: role || 'user' },
        select: { id: true, email: true, name: true, role: true }
    });
    return user; // Kembalikan user
};
exports.createUser = createUser;
// Fungsi getUserById di service tidak lagi mengambil `res`
const getUserById = async (userId, requesterId, requesterRole) => {
    if (isNaN(userId)) {
        throw new AppError_1.default('ID pengguna tidak valid.', 400);
    }
    if (requesterRole !== 'admin' && requesterId !== userId) {
        throw new AppError_1.default('Terlarang: Anda tidak memiliki akses ke pengguna ini.', 403);
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
    });
    if (!user) {
        throw new AppError_1.default('Pengguna tidak ditemukan.', 404);
    }
    return user; // Kembalikan user
};
exports.getUserById = getUserById;
// Fungsi updateUser di service tidak lagi mengambil `res`
const updateUser = async (targetUserId, updateData, // data dari req.body
requesterId, requesterRole) => {
    if (isNaN(targetUserId)) {
        throw new AppError_1.default('ID pengguna tidak valid.', 400);
    }
    if (requesterRole !== 'admin' && requesterId !== targetUserId) {
        throw new AppError_1.default('Terlarang: Anda tidak memiliki akses untuk memperbarui pengguna ini.', 403);
    }
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existingUser) {
        throw new AppError_1.default('Pengguna tidak ditemukan.', 404);
    }
    const dataToUpdate = {};
    if (updateData.email !== undefined) { // Cek jika email disediakan
        if (!isValidEmail(updateData.email)) {
            throw new AppError_1.default('Format email tidak valid.', 400);
        }
        const emailExists = await prisma_1.prisma.user.findUnique({ where: { email: updateData.email } });
        if (emailExists && emailExists.id !== targetUserId) {
            throw new AppError_1.default('Email sudah digunakan oleh pengguna lain.', 409);
        }
        dataToUpdate.email = updateData.email;
    }
    if (updateData.name !== undefined) {
        dataToUpdate.name = updateData.name;
    }
    if (updateData.password !== undefined) {
        if (!isValidPassword(updateData.password)) {
            throw new AppError_1.default('Password minimal 6 karakter wajib diisi.', 400);
        }
        dataToUpdate.password = await bcryptjs_1.default.hash(updateData.password, 10);
    }
    if (updateData.role !== undefined) {
        if (requesterRole !== 'admin') {
            throw new AppError_1.default('Hanya admin yang dapat memperbarui peran.', 403);
        }
        if (!['user', 'admin'].includes(updateData.role)) {
            throw new AppError_1.default('Peran tidak valid.', 400);
        }
        dataToUpdate.role = updateData.role;
    }
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: targetUserId },
        data: dataToUpdate,
        select: { id: true, email: true, name: true, role: true }
    });
    return updatedUser; // Kembalikan user
};
exports.updateUser = updateUser;
// Fungsi deleteUser di service tidak lagi mengambil `res`
const deleteUser = async (targetUserId, requesterId, requesterRole) => {
    if (isNaN(targetUserId)) {
        throw new AppError_1.default('ID pengguna tidak valid.', 400);
    }
    if (requesterRole !== 'admin' && requesterId !== targetUserId) {
        throw new AppError_1.default('Terlarang: Anda tidak memiliki akses untuk menghapus pengguna ini.', 403);
    }
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existingUser) {
        throw new AppError_1.default('Pengguna tidak ditemukan.', 404);
    }
    // Jika admin menghapus dirinya sendiri
    if (requesterRole === 'admin' && requesterId === targetUserId) {
        // Pertimbangkan apakah admin boleh menghapus dirinya sendiri.
        // Untuk aplikasi sederhana, mungkin boleh. Untuk produksi, perlu logic khusus.
        // Contoh: throw new AppError('Admin tidak bisa menghapus akunnya sendiri.', 403);
    }
    await prisma_1.prisma.user.delete({ where: { id: targetUserId } });
    return; // Tidak mengembalikan apa-apa untuk 204 No Content
};
exports.deleteUser = deleteUser;
// Fungsi getProfile di service tidak lagi mengambil `res`
const getProfile = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
    });
    if (!user) {
        throw new AppError_1.default('Profil pengguna tidak ditemukan.', 404);
    }
    return user; // Kembalikan user
};
exports.getProfile = getProfile;
// Fungsi updateProfile di service tidak lagi mengambil `res`
const updateProfile = async (userId, updateData) => {
    const dataToUpdate = {};
    if (updateData.email !== undefined) {
        if (!isValidEmail(updateData.email)) {
            throw new AppError_1.default('Format email tidak valid.', 400);
        }
        const emailExists = await prisma_1.prisma.user.findUnique({ where: { email: updateData.email } });
        if (emailExists && emailExists.id !== userId) {
            throw new AppError_1.default('Email sudah digunakan oleh pengguna lain.', 409);
        }
        dataToUpdate.email = updateData.email;
    }
    if (updateData.name !== undefined) {
        dataToUpdate.name = updateData.name;
    }
    if (updateData.password !== undefined) {
        if (!isValidPassword(updateData.password)) {
            throw new AppError_1.default('Password minimal 6 karakter wajib diisi.', 400);
        }
        dataToUpdate.password = await bcryptjs_1.default.hash(updateData.password, 10);
    }
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: { id: true, email: true, name: true, role: true }
    });
    return updatedUser; // Kembalikan user
};
exports.updateProfile = updateProfile;
// Get all users (admin only)
const getAllUsers = async (requesterRole) => {
    if (requesterRole !== 'admin') {
        throw new AppError_1.default('Terlarang: Hanya admin yang dapat melihat daftar pengguna.', 403);
    }
    const users = await prisma_1.prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true },
        orderBy: { id: 'asc' }
    });
    return users;
};
exports.getAllUsers = getAllUsers;
