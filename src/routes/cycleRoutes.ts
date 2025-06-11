import express from 'express';
import {
  getCycles,
  getCycleById,
  createCycle,
  updateCycle,
  deleteCycle,
  searchCycles,
  getCycleStats,
} from '../controllers/cycleController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCycles);
router.get('/search', searchCycles);
router.get('/stats', authorizeRole('admin'), getCycleStats);
router.get('/:id', getCycleById);
router.post('/', createCycle);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;
