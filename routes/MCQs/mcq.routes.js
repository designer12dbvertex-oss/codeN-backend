import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';
import {
  createMCQ,
  getAllMCQs,
  getMCQById,
  updateMCQ,
  deleteMCQ,
  toggleMCQStatus,
} from '../../controllers/MCQs/mcq.controller.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Create MCQ
router.post('/', createMCQ);

// Get all MCQs
router.get('/', getAllMCQs);

// Get single MCQ
router.get('/:id', getMCQById);

// Update MCQ
router.patch('/:id', updateMCQ);

// Delete MCQ (soft delete)
router.delete('/:id', deleteMCQ);

// Toggle MCQ status (enable/disable)
router.patch('/:id/status', toggleMCQStatus);

export default router;
