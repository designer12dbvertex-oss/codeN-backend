import express from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  getTestForAttempt,
  getTestFilters,
  previewTestQuestions,
  updateTest,
  deleteTest,
} from '../../../controllers/admin/Test/testController.js';
import { validateAdminToken as adminAuth } from '../../../middleware/adminToken.middleware.js';

// import { userAuth } from '../../../middleware/authMiddleware.js'; // For user attempt

const router = express.Router();

// ===== ADMIN ROUTES =====

// Create Test
router.post('/create', adminAuth, createTest);

// Get all tests with filters
router.get('/', adminAuth, getAllTests);

// Get test by ID
router.get('/:testId', adminAuth, getTestById);

// Get available filters for creating Subject Test
router.get('/filters/:courseId', adminAuth, getTestFilters);

// Preview questions before creating test
router.post('/preview', adminAuth, previewTestQuestions);

// Update test
router.put('/:testId', adminAuth, updateTest);

// Delete test
router.delete('/:testId', adminAuth, deleteTest);

// ===== USER ROUTES =====

// Get test for attempt (with questions)
// router.get('/user/:testId/attempt', userAuth, getTestForAttempt);

export default router;
