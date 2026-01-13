import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';
import {
  createSubSubject,
  getAllSubSubjects,
  getSubSubjectById,
  updateSubSubject,
  deleteSubSubject,
  toggleSubSubjectStatus,
} from '../../controllers/Sub-subject/subSubject.controller.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Create sub-subject
router.post('/', createSubSubject);

// Get all sub-subjects
router.get('/', getAllSubSubjects);

// Get single sub-subject
router.get('/:id', getSubSubjectById);

// Update sub-subject
router.patch('/:id', updateSubSubject);

// Delete sub-subject (soft delete)
router.delete('/:id', deleteSubSubject);

// Toggle sub-subject status (enable/disable)
router.patch('/:id/status', toggleSubSubjectStatus);

export default router;
