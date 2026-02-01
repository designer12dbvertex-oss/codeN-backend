
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

/**
 * @swagger
 * tags:
 *   name: Admin Chapter Management
 *   description: APIs for Managing Course Chapters (Modules/Topics)
 */

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/chapters:
 *   post:
 *     summary: Create a new chapter
 *     tags: [Admin Chapter Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subSubjectId
 *             properties:
 *               name:
 *                 type: string
 *               subSubjectId:
 *                 type: string
 *           
 *               order:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Chapter created successfully
 */

router.post('/', upload.single('image'), createChapter);

/**
 * @swagger
 * /api/admin/chapters:
 *   get:
 *     summary: Get all chapters
 *     tags: [Admin Chapter Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subSubjectId
 *         schema:
 *           type: string
 *         description: Filter chapters by sub-subject ID
 *     responses:
 *       200:
 *         description: List of chapters fetched successfully
 */
router.get('/', getAllChapters);

router.get('/sub-subject/:subSubjectId', getChapterBySubSubjectId);
/**
 * @swagger
 * /api/admin/chapters/{id}:
 *   get:
 *     summary: Get a single chapter by ID
 *     tags: [Admin Chapter Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chapter details fetched successfully
 *       404:
 *         description: Chapter not found
 */
router.get('/:id', getChapterById);

/**
 * @swagger
 * /api/admin/chapters/{id}:
 *   patch:
 *     summary: Update an existing chapter
 *     tags: [Admin Chapter Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               order:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Chapter updated successfully
 */
router.patch('/:id', upload.single('image'), updateChapter);

/**
 * @swagger
 * /api/admin/chapters/{id}:
 *   delete:
 *     summary: Delete a chapter (Soft Delete)
 *     tags: [Admin Chapter Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chapter deleted successfully
 */
router.delete('/:id', deleteChapter);

/**
 * @swagger
 * /api/admin/chapters/{id}/status:
 *   patch:
 *     summary: Toggle chapter status (Active/Inactive)
 *     tags: [Admin Chapter Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/:id/status', toggleChapterStatus);

export default router;
