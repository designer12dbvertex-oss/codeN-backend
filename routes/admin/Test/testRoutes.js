import express from 'express';
import {
  createTest,
  getCourseFilters,
  getAllTests,
  getSingleTest,
  updateTest,
  deleteTest,
} from '../../../controllers/admin/Test/testController.js';

import { protect, adminOnly } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllTests);
router.get('/filters/:courseId', protect, adminOnly, getCourseFilters);
router.post('/create', protect, adminOnly, createTest);
router.get('/:id', protect, adminOnly, getSingleTest);
router.put('/:id', protect, adminOnly, updateTest);
router.delete('/:id', protect, adminOnly, deleteTest);

export default router;
