"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
// src/services/authService.ts
const prisma_1 = require("../prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
const JWT_SECRET = process.env.JWT_SECRET || 'trackerhaidkey'; // Pastikan ini diatur di .env!
const registerUser = async ({ email, name, password, role }) => {
    if (!email || !password) {
        throw new AppError_1.default('Email dan password wajib diisi.', 400);
    }
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError_1.default('Pengguna dengan email ini sudah terdaftar.', 409); // 409 Conflict
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const validRoles = ['user', 'admin'];
    const assignedRole = (role && validRoles.includes(role)) ? role : 'user';
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: assignedRole,
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
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
exports.registerUser = registerUser;
const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new AppError_1.default('Email dan password wajib diisi.', 400);
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        throw new AppError_1.default('Email atau password salah.', 401);
    }
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid) {
        throw new AppError_1.default('Email atau password salah.', 401);
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
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
exports.loginUser = loginUser;
