import express from 'express';
import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';
import uploadAdminProfile from '../../../middleware/upload.js';
import {
  createMCQ,
  getAllMCQs,
  getMCQById,
  updateMCQ,
  deleteMCQ,
  toggleMCQStatus,
  getChaptersBySubSubject,
  getTopicsByChapter,
} from '../../../controllers/admin/MCQs/mcq.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin MCQ Management
 *   description: APIs for Managing Questions, Options, Images, and Explanations
 */

// All routes protected and only for admin
router.use(protect);
router.use(authorize('admin'));

/**
 * Multer fields for MCQ images
 */
const mcqUploadFields = uploadAdminProfile.fields([
  { name: 'questionImages', maxCount: 5 },
  { name: 'explanationImages', maxCount: 5 },
  { name: 'optionImage_0', maxCount: 1 },
  { name: 'optionImage_1', maxCount: 1 },
  { name: 'optionImage_2', maxCount: 1 },
  { name: 'optionImage_3', maxCount: 1 },
]);

/**
 * Create MCQ
 * POST /api/admin/mcqs
 * (Accepts multipart/form-data)
 */
router.post('/', mcqUploadFields, createMCQ);
/**
 * Get Chapters by Subject + SubSubject
 */
router.get('/chapters', getChaptersBySubSubject);
/**
 * Get all MCQs with filters (courseId, subjectId, subSubjectId, topicId, chapterId, tagId, status, difficulty)
 * GET /api/admin/mcqs
 */
router.get('/', getAllMCQs);

/**
 * Get MCQ details by id
 * GET /api/admin/mcqs/:id
 */
router.get('/:id', getMCQById);

/**
 * Update MCQ (multipart/form-data supported for replacing/adding images)
 * PUT /api/admin/mcqs/:id
 */
router.put('/:id', mcqUploadFields, updateMCQ);

/**
 * Delete MCQ
 * DELETE /api/admin/mcqs/:id
 */
router.delete('/:id', deleteMCQ);

/**
 * Toggle status
 * PATCH /api/admin/mcqs/:id/status
 */
router.patch('/:id/status', toggleMCQStatus);

/**
 * Get Topics by Chapter
 */
router.get('/topics', getTopicsByChapter);

export default router;
