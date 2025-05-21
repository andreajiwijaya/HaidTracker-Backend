import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

export default router;
