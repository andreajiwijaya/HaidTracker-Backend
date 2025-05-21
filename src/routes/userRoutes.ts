import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserCount,
  getUsersPaginated,
  searchUsers,
  getProfile,
  updateProfile,
} from '../controllers/userController';

import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

// Create user: open route
router.post('/', createUser);

// Routes below require auth
router.use(authenticateToken);

// Admin-only routes:
router.get('/', authorizeRole('admin'), getUsers);
router.get('/count', authorizeRole('admin'), getUserCount);
router.get('/paginated', authorizeRole('admin'), getUsersPaginated);
router.get('/search', authorizeRole('admin'), searchUsers);

// Admin or self routes:
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
