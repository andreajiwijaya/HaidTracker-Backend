"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const JWT_SECRET = process.env.JWT_SECRET || 'trackerhaidkey';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        throw new AppError_1.default('Token akses tidak ada.', 401);
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        req.userRole = payload.role;
        console.log('DEBUG: authMiddleware - User ID:', req.userId, 'Role:', req.userRole);
        next();
    }
    catch (error) {
        throw new AppError_1.default('Token tidak valid atau kedaluwarsa.', 403);
    }
};
exports.authenticateToken = authenticateToken;
