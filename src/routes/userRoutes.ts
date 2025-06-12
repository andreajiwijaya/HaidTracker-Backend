import express from 'express';
import {
  getUserById,
  getAllUsers, // <-- import baru
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} from '../controllers/userController';

import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

router.use(authenticateToken);

// Route untuk create user (hanya admin)
router.post('/', authorizeRole('admin'), createUser);

// Route untuk get all users (hanya admin)
router.get('/', authorizeRole('admin'), getAllUsers);

// Route khusus profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Route user by id
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
