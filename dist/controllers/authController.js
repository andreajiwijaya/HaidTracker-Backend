"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const AppError_1 = __importDefault(require("../utils/AppError")); // Import AppError
const register = async (req, res) => {
    try {
        const result = await (0, authService_1.registerUser)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        // Perbaikan: Tangani AppError secara spesifik
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Terjadi kesalahan server saat pendaftaran.' });
        }
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const result = await (0, authService_1.loginUser)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        // Perbaikan: Tangani AppError secara spesifik
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Terjadi kesalahan server saat login.' });
        }
    }
};
exports.login = login;
