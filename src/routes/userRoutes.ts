import express from 'express';
import { getUsers, createUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, getUsers);
router.post('/', createUser);

export default router;
