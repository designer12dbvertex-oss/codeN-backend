import express from 'express';
import {
  createTest,
  getCourseFilters,
  getAllTests,
  getSingleTest,
  updateTest,
  deleteTest,
  addMcqToTest,
  addMcqByCodonId,
} from '../../../controllers/admin/Test/testController.js';

import { protect, adminOnly } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllTests);
router.get('/filters/:courseId', protect, adminOnly, getCourseFilters);
router.post('/create', protect, adminOnly, createTest);
router.get('/:id', protect, adminOnly, getSingleTest);
router.put('/:id', protect, adminOnly, updateTest);
router.delete('/:id', protect, adminOnly, deleteTest);
router.put('/:id/add-mcq', protect, adminOnly, addMcqToTest);

router.post(
  '/:testId/add-mcq-by-codon',
  protect,
  authorize('admin'),
  addMcqByCodonId
);

export default router;
