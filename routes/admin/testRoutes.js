import express from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
} from '../../controllers/admin/testController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';
import uploadAdminProfile from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Test Management
 *   description: APIs for creating and managing Full Length Tests, Subject Tests, and Mock Exams
 */

// Sabhi routes protected hain aur sirf admin ke liye hain
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/tests/upload-image:
 *   post:
 *     summary: Upload an image for test or MCQ content
 *     tags: [Admin Test Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                   example: "/uploads/mcq-images/1705678.png"
 */
router.post('/upload-image', uploadAdminProfile.single('image'), (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: 'No file uploaded' });

  const filePath = `/uploads/mcq-images/${req.file.filename}`;
  res.status(200).json({ success: true, url: filePath });
});

/**
 * @swagger
 * /api/admin/tests:
 *   post:
 *     summary: Create a new test/exam
 *     tags: [Admin Test Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, courseId, duration]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Grand Mock Test 1"
 *               description:
 *                 type: string
 *               courseId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *                 description: Optional for full length tests
 *               duration:
 *                 type: number
 *                 description: Test duration in minutes
 *               totalMarks:
 *                 type: number
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of MCQ IDs
 *     responses:
 *       201:
 *         description: Test created successfully
 *   get:
 *     summary: Get all tests
 *     tags: [Admin Test Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tests fetched successfully
 */
router.route('/').post(createTest).get(getAllTests);

/**
 * @swagger
 * /api/admin/tests/{id}:
 *   get:
 *     summary: Get test details by ID
 *     tags: [Admin Test Management]
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
 *         description: Test data fetched successfully
 *   put:
 *     summary: Update an existing test
 *     tags: [Admin Test Management]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: number
 *     responses:
 *       200:
 *         description: Test updated successfully
 *   delete:
 *     summary: Delete a test
 *     tags: [Admin Test Management]
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
 *         description: Test deleted successfully
 */
router.route('/:id').get(getTestById).put(updateTest).delete(deleteTest);

export default router;
