import express from 'express';
import {
  getSymptoms,
  createSymptom,
  updateSymptom,
  deleteSymptom,
} from '../controllers/symptomController';

import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken); // Semua route butuh login dulu

router.get('/', getSymptoms);
router.post('/', createSymptom);
router.put('/:id', updateSymptom);
router.delete('/:id', deleteSymptom);

export default router;
