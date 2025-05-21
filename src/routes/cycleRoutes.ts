import express from 'express';
import {
  getCycles,
  createCycle,
  updateCycle,
  deleteCycle,
} from '../controllers/cycleController';

import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken); // Semua route butuh login dulu

router.get('/', getCycles);
router.post('/', createCycle);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;
