import express from 'express';
import { getUsers, createUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

// hanya admin yang boleh mengakses daftar semua user
router.get('/', authenticateToken, authorizeRole('admin'), getUsers);

// semua orang boleh register user baru
router.post('/', createUser);

export default router;
