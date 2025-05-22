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

router.use(authenticateToken);

router.post('/', authenticateToken, authorizeRole('admin'), createUser);

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
