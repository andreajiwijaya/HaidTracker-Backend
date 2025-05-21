import express from 'express';
import {
  getSymptoms,
  getSymptomById,
  createSymptom,
  updateSymptom,
  deleteSymptom,
  getSymptomsByUser,
  getSymptomCount,
  getMostRecentSymptom,
  getSymptomsByMoodKeyword,
  searchSymptoms,
} from '../controllers/symptomController';

import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/authorizeMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSymptoms); // endpoint 1: get symptoms user sendiri
router.get('/:id', getSymptomById); // 2: get by id (user/admin)

router.post('/', createSymptom); // 3: create new symptom
router.put('/:id', updateSymptom); // 4: update symptom by id
router.delete('/:id', deleteSymptom); // 5: delete symptom by id

router.get('/user/:userId', authorizeRole('admin'), getSymptomsByUser); // 6: admin get symptoms by userId

router.get('/count', getSymptomCount); // 7: count symptoms user sendiri
router.get('/recent', getMostRecentSymptom); // 8: most recent symptom user sendiri
router.get('/mood', getSymptomsByMoodKeyword); // 9: filter symptoms by mood keyword
router.get('/search', searchSymptoms); // 10: search symptoms by date range or keyword

export default router;
