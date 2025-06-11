"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const register = async (req, res) => {
    try {
        const result = await (0, authService_1.registerUser)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const result = await (0, authService_1.loginUser)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Terjadi kesalahan server saat login' });
    }
};
exports.login = login;
