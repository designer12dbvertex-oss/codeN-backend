import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus,
} from '../../controllers/Subject/subject.controller.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Create subject
router.post('/', createSubject);

// Get all subjects
router.get('/', getAllSubjects);

// Get single subject
router.get('/:id', getSubjectById);

// Update subject
router.patch('/:id', updateSubject);

// Delete subject (soft delete)
router.delete('/:id', deleteSubject);

// Toggle subject status (enable/disable)
router.patch('/:id/status', toggleSubjectStatus);

export default router;
