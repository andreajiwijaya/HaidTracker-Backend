import express from 'express';
import {
  getAllRemindersForAdmin,
  getUserReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getReminderById,
} from '../controllers/reminderController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/all', authorizeRole('admin'), getAllRemindersForAdmin);
router.get('/', getUserReminders);
router.post('/', createReminder);
router.get('/:id', getReminderById);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
