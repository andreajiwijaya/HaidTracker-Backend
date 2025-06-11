import express from 'express';
import {
  getAllAnalyticsForAdmin,
  getUserAnalytics,
  createAnalytic,
  updateAnalytic,
  deleteAnalytic,
  getAnalyticById,
} from '../controllers/analyticController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/all', authorizeRole('admin'), getAllAnalyticsForAdmin);
router.get('/', getUserAnalytics);
router.post('/', createAnalytic);
router.get('/:id', getAnalyticById);
router.put('/:id', updateAnalytic);
router.delete('/:id', deleteAnalytic);

export default router;
