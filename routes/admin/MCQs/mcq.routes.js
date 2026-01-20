
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
} from '../../../controllers/admin/MCQs/mcq.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin MCQ Management
 *   description: APIs for Managing Questions, Options, Images, and Explanations
 */

// Sabhi routes protected hain aur sirf admin ke liye hain
router.use(protect);
router.use(authorize('admin'));

/**
 * 🔹 Multer Configuration for MCQ Images
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
 * @swagger
 * /api/admin/mcqs:
 *   post:
 *     summary: Create a new MCQ with multiple images
 *     tags: [Admin MCQ Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - subjectId
 *               - subSubjectId
 *               - chapterId
 *               - questionText
 *               - correctAnswer
 *             properties:
 *               courseId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               subSubjectId:
 *                 type: string
 *               chapterId:
 *                 type: string
 *               tagId:
 *                 type: string
 *               questionText:
 *                 type: string
 *                 description: Text content of the question
 *               questionImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               option_0:
 *                 type: string
 *                 description: Text for option 1
 *               optionImage_0:
 *                 type: string
 *                 format: binary
 *               option_1:
 *                 type: string
 *               optionImage_1:
 *                 type: string
 *                 format: binary
 *               option_2:
 *                 type: string
 *               optionImage_2:
 *                 type: string
 *                 format: binary
 *               option_3:
 *                 type: string
 *               optionImage_3:
 *                 type: string
 *                 format: binary
 *               correctAnswer:
 *                 type: integer
 *                 description: Index of correct option (0, 1, 2, 3)
 *               explanationText:
 *                 type: string
 *               explanationImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               marks:
 *                 type: number
 *               negativeMarks:
 *                 type: number
 *     responses:
 *       201:
 *         description: MCQ created successfully
 */
router.post('/', mcqUploadFields, createMCQ);

/**
 * @swagger
 * /api/admin/mcqs:
 *   get:
 *     summary: Get all MCQs with filters
 *     tags: [Admin MCQ Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: List of MCQs fetched successfully
 */
router.get('/', getAllMCQs);

/**
 * @swagger
 * /api/admin/mcqs/{id}:
 *   get:
 *     summary: Get MCQ details by ID
 *     tags: [Admin MCQ Management]
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
 *         description: MCQ data fetched successfully
 */
router.get('/:id', getMCQById);

/**
 * @swagger
 * /api/admin/mcqs/{id}:
 *   put:
 *     summary: Update MCQ details and images
 *     tags: [Admin MCQ Management]
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
 *               questionText:
 *                 type: string
 *               questionImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               correctAnswer:
 *                 type: integer
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: MCQ updated successfully
 */
router.put('/:id', mcqUploadFields, updateMCQ);

/**
 * @swagger
 * /api/admin/mcqs/{id}:
 *   delete:
 *     summary: Delete an MCQ
 *     tags: [Admin MCQ Management]
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
 *         description: MCQ deleted successfully
 */
router.delete('/:id', deleteMCQ);

/**
 * @swagger
 * /api/admin/mcqs/{id}/status:
 *   patch:
 *     summary: Toggle MCQ active/inactive status
 *     tags: [Admin MCQ Management]
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
router.patch('/:id/status', toggleMCQStatus);

export default router;
