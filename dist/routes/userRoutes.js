"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authorizeMiddleware_1 = require("../middleware/authorizeMiddleware");
const router = express_1.default.Router();
// Semua route di bawah harus autentikasi dulu
router.use(authMiddleware_1.authenticateToken);
// Route untuk create user (hanya admin)
router.post('/', (0, authorizeMiddleware_1.authorizeRole)('admin'), userController_1.createUser);
// Pastikan route spesifik 'profile' diletakkan sebelum parameter ':id'
router.get('/profile', userController_1.getProfile);
router.put('/profile', userController_1.updateProfile);
// Routes user berdasarkan id (admin atau user itu sendiri)
router.get('/:id', userController_1.getUserById);
router.put('/:id', userController_1.updateUser);
router.delete('/:id', userController_1.deleteUser);
exports.default = router;
