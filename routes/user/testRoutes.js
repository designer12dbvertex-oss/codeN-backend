import express from 'express';
import {
  getAvailableTests,
  startTest,
  getNextQuestion,
  submitAnswer,
  submitTest,
} from '../../controllers/user/testAttemptController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAvailableTests);
router.post('/:testId/start', protect, startTest);
router.get('/attempt/:attemptId/question', protect, getNextQuestion);
router.post('/attempt/:attemptId/answer', protect, submitAnswer);
router.post('/attempt/:attemptId/submit', protect, submitTest);

export default router;
