import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';
import {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  toggleChapterStatus,
} from '../../controllers/Chapter/chapter.controller.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Create chapter
router.post('/', createChapter);

// Get all chapters
router.get('/', getAllChapters);

// Get single chapter
router.get('/:id', getChapterById);

// Update chapter
router.patch('/:id', updateChapter);

// Delete chapter (soft delete)
router.delete('/:id', deleteChapter);

// Toggle chapter status (enable/disable)
router.patch('/:id/status', toggleChapterStatus);

export default router;
