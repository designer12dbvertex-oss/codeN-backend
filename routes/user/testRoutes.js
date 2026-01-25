// import express from 'express';
// import {
//   getAvailableTests,
//   startTest,
//   getNextQuestion,
//   submitAnswer,
//   submitTest,
//   getTestResult,
//   getTestReview,
// } from '../../controllers/user/testAttemptController.js';
// import { protect } from '../../middleware/authMiddleware.js';

// const router = express.Router();

// // Result & Review
// router.get('/test-result/:userId/:testId', protect, getTestResult);
// router.get('/test-review/:userId/:testId', protect, getTestReview);

// // Browse Tests
// router.get('/', protect, getAvailableTests);

// // Start Test
// router.post('/:testId/start', protect, startTest);

// // Test Flow
// router.get('/attempt/:attemptId/question', protect, getNextQuestion);
// router.post('/attempt/:attemptId/answer', protect, submitAnswer);
// router.post('/attempt/:attemptId/submit', protect, submitTest);

// export default router;

import express from 'express';
import {
  getAvailableTests,
  startTest,
  getNextQuestion,
  submitAnswer,
  submitTest,
  getTestResult,
  getTestReview,
} from '../../controllers/user/testAttemptController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Result & Review (protected)
router.get('/test-result/:userId/:testId', protect, getTestResult);
router.get('/test-review/:userId/:testId', protect, getTestReview);

// Browse Tests (exam mode only)
router.get('/exam', protect, getAvailableTests);

// Start Test (start or resume) -> returns full MCQs + remainingTime
router.post('/exam/:testId/start', protect, startTest);

// Legacy / Sequential Flow: next question
router.get('/attempt/:attemptId/question', protect, getNextQuestion);

// Submit Answer (keeps existing route signature)
// Accepts:
//  - { mcqId, optionId }   -> update/overwrite specified mcq
//  - OR { selectedOption } -> legacy sequential behavior using currentIndex
router.post('/attempt/:attemptId/answer', protect, submitAnswer);

// Submit Test (manual)
router.post('/attempt/:attemptId/submit', protect, submitTest);

export default router;
