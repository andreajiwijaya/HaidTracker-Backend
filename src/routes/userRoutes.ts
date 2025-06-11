import express from 'express';
import {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} from '../controllers/userController';

import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

// Semua route di bawah harus autentikasi dulu
router.use(authenticateToken);

// Route untuk create user (hanya admin)
router.post('/', authorizeRole('admin'), createUser);

// Pastikan route spesifik 'profile' diletakkan sebelum parameter ':id'
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Routes user berdasarkan id (admin atau user itu sendiri)
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
