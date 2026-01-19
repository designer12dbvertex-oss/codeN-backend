// import express from 'express';
// import {
//   getAvailableTests,
//   startTest,
//   getNextQuestion,
//   submitAnswer,
//   submitTest,
// } from '../../controllers/user/testAttemptController.js';
// import { protect } from '../../middleware/authMiddleware.js';

// const router = express.Router();

// router.get('/', protect, getAvailableTests);
// router.post('/:testId/start', protect, startTest);
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

router.get('/test-result/:userId/:testId',protect, getTestResult);
router.get('/test-review/:userId/:testId',getTestReview);

/**
 * @swagger
 * tags:
 *   name: Test Attempts
 *   description: APIs for users to browse, start, and attempt tests/exams
 */

/**
 * @swagger
 * /api/tests:
 *   get:
 *     summary: Get all available tests for the user
 *     tags: [Test Attempts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available tests fetched successfully
 *       401:
 *         description: Unauthorized - Token missing or invalid
 */
router.get('/', protect, getAvailableTests);

/**
 * @swagger
 * /api/tests/{testId}/start:
 *   post:
 *     summary: Start a specific test attempt
 *     tags: [Test Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the test to start
 *     responses:
 *       201:
 *         description: Test attempt started successfully
 *       404:
 *         description: Test not found
 */
router.post('/:testId/start', protect, startTest);

/**
 * @swagger
 * /api/tests/attempt/{attemptId}/question:
 *   get:
 *     summary: Get the next or current question for an ongoing attempt
 *     tags: [Test Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the current test attempt
 *     responses:
 *       200:
 *         description: Question data fetched successfully
 *       404:
 *         description: Attempt not found
 */
router.get('/attempt/:attemptId/question', protect, getNextQuestion);

/**
 * @swagger
 * /api/tests/attempt/{attemptId}/answer:
 *   post:
 *     summary: Submit an answer for a specific question in the test
 *     tags: [Test Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the current test attempt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - selectedIndex
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: The ID of the question being answered
 *               selectedIndex:
 *                 type: integer
 *                 description: The index of the selected option (0, 1, 2, 3)
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 */
router.post('/attempt/:attemptId/answer', protect, submitAnswer);

/**
 * @swagger
 * /api/tests/attempt/{attemptId}/submit:
 *   post:
 *     summary: Final submission of the test attempt to get results
 *     tags: [Test Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the attempt to finalize
 *     responses:
 *       200:
 *         description: Test submitted successfully and result calculated
 */
router.post('/attempt/:attemptId/submit', protect, submitTest);

export default router;
