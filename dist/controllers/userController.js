"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const userService = __importStar(require("../services/userService"));
const AppError_1 = __importDefault(require("../utils/AppError"));
// Create user (only admin)
const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body, req.userRole);
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal membuat pengguna baru.' });
        }
    }
};
exports.createUser = createUser;
// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers(req.userRole);
        res.json(users);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil daftar pengguna.' });
        }
    }
};
exports.getAllUsers = getAllUsers;
// Get user by id (admin or self)
const getUserById = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'ID pengguna tidak valid.' });
            return;
        }
        const user = await userService.getUserById(userId, req.userId, req.userRole);
        res.json(user);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil detail pengguna.' });
        }
    }
};
exports.getUserById = getUserById;
// Update user (admin or self)
const updateUser = async (req, res) => {
    try {
        const targetUserId = Number(req.params.id);
        if (isNaN(targetUserId)) {
            res.status(400).json({ error: 'ID pengguna tidak valid.' });
            return;
        }
        const updatedUser = await userService.updateUser(targetUserId, req.body, req.userId, req.userRole);
        res.json(updatedUser);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal memperbarui pengguna.' });
        }
    }
};
exports.updateUser = updateUser;
// Delete user (admin or self)
const deleteUser = async (req, res) => {
    try {
        const targetUserId = Number(req.params.id);
        if (isNaN(targetUserId)) {
            res.status(400).json({ error: 'ID pengguna tidak valid.' });
            return;
        }
        await userService.deleteUser(targetUserId, req.userId, req.userRole);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal menghapus pengguna.' });
        }
    }
};
exports.deleteUser = deleteUser;
// Get own profile (self only)
const getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.userId);
        res.json(user);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal mengambil profil.' });
        }
    }
};
exports.getProfile = getProfile;
// Update own profile (self only)
const updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateProfile(req.userId, req.body);
        res.json(updatedUser);
    }
    catch (error) {
        if (error instanceof AppError_1.default) {
            res.status(error.status).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Gagal memperbarui profil.' });
        }
    }
};
exports.updateProfile = updateProfile;
