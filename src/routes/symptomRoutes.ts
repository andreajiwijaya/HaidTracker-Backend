import express from 'express';
import {
  getSymptoms,
  getSymptomById,
  createSymptom,
  updateSymptom,
  deleteSymptom,
  getSymptomsByUser,
} from '../controllers/symptomController';

import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSymptoms);
router.get('/:id', getSymptomById);
router.post('/', createSymptom);
router.put('/:id', updateSymptom);
router.delete('/:id', deleteSymptom);
router.get('/user/:userId', authorizeRole('admin'), getSymptomsByUser);

export default router;
