import express from 'express';
import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';
import {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  toggleChapterStatus,
  getChapterBySubSubjectId,
} from '../../../controllers/admin/Chapter/chapter.controller.js';

import upload from '../../../middleware/upload.js';

const router = express.Router();

// 🔐 All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// CREATE CHAPTER
router.post('/', upload.single('image'), createChapter);

// LIST ALL CHAPTERS
router.get('/', getAllChapters);

// LIST CHAPTERS BY SUB-SUBJECT (+ OPTIONAL TOPIC)
router.get('/sub-subject/:subSubjectId', getChapterBySubSubjectId);

// GET SINGLE CHAPTER
router.get('/:id', getChapterById);

// UPDATE CHAPTER
router.put('/:id', upload.single('image'), updateChapter);

// DELETE CHAPTER (PERMANENT)
router.delete('/:id', deleteChapter);

// TOGGLE STATUS (ACTIVE / INACTIVE)
router.patch('/:id/status', toggleChapterStatus);

export default router;
