


import express from 'express';
import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  publishCourse,
  unpublishCourse,
} from '../../../controllers/admin/Course/course.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Course Management
 *   description: APIs for Managing Courses (Medical, Engineering, etc.)
 */

// Sabhi routes protected hain aur sirf admin access kar sakta hai
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Admin Course Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "NEET Preparation 2024"
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post('/', createCourse);

/**
 * @swagger
 * /api/admin/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Admin Course Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all courses fetched successfully
 */
router.get('/', getAllCourses);

/**
 * @swagger
 * /api/admin/courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     tags: [Admin Course Management]
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
 *         description: Course details fetched successfully
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourseById);

/**
 * @swagger
 * /api/admin/courses/{id}:
 *   patch:
 *     summary: Update course details
 *     tags: [Admin Course Management]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 */
router.patch('/:id', updateCourse);

/**
 * @swagger
 * /api/admin/courses/{id}:
 *   delete:
 *     summary: Delete a course (Soft Delete)
 *     tags: [Admin Course Management]
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
 *         description: Course deleted successfully
 */
router.delete('/:id', deleteCourse);

/**
 * @swagger
 * /api/admin/courses/{id}/status:
 *   patch:
 *     summary: Toggle course status (Active/Inactive)
 *     tags: [Admin Course Management]
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
router.patch('/:id/status', toggleCourseStatus);

/**
 * @swagger
 * /api/admin/courses/{id}/publish:
 *   patch:
 *     summary: Publish a course to make it live for users
 *     tags: [Admin Course Management]
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
 *         description: Course published successfully
 */
router.patch('/:id/publish', publishCourse);

/**
 * @swagger
 * /api/admin/courses/{id}/unpublish:
 *   patch:
 *     summary: Unpublish a course to hide it from users
 *     tags: [Admin Course Management]
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
 *         description: Course unpublished successfully
 */
router.patch('/:id/unpublish', unpublishCourse);

export default router;
