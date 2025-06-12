"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const AppError_1 = __importDefault(require("../utils/AppError"));
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        console.log('DEBUG: authorizeMiddleware - Checking for role:', requiredRole, 'Current user role:', req.userRole);
        if (!req.userRole) {
            throw new AppError_1.default('Peran pengguna tidak ditemukan, tidak terotorisasi.', 401);
        }
        if (req.userRole !== requiredRole) {
            throw new AppError_1.default('Terlarang: hak akses tidak mencukupi.', 403);
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
