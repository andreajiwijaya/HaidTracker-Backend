import express from 'express';
import {
  getCycles,
  getCycleById,
  createCycle,
  updateCycle,
  deleteCycle,
  getCyclesByUser,
  getCycleCount,
  getMostRecentCycle,
  getCyclesWithNotes,
  searchCycles,
} from '../controllers/cycleController';

import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCycles); 

// Admin only
router.get('/user/:userId', authorizeRole('admin'), getCyclesByUser); 

// User only 
router.get('/count', getCycleCount);
router.get('/recent', getMostRecentCycle);
router.get('/notes', getCyclesWithNotes);
router.get('/search', searchCycles);

router.get('/:id', getCycleById);
router.post('/', createCycle);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;
