// import express from 'express';
// import { protect } from '../../../middleware/authMiddleware.js';
// import { authorize } from '../../../middleware/Authorization.middleware.js';
// import {
//   createSubject,
//   getAllSubjects,
//   getSubjectById,
//   updateSubject,
//   deleteSubject,
//   toggleSubjectStatus,
// } from '../../../controllers/admin/Subject/subject.controller.js';

// const router = express.Router();

// // All routes are protected and require admin role
// router.use(protect);
// router.use(authorize('admin'));

// // Create subject
// router.post('/', createSubject);

// // Get all subjects
// router.get('/', getAllSubjects);

// // Get single subject
// router.get('/:id', getSubjectById);

// // Update subject
// router.patch('/:id', updateSubject);

// // Delete subject (soft delete)
// router.delete('/:id', deleteSubject);

// // Toggle subject status (enable/disable)
// router.patch('/:id/status', toggleSubjectStatus);

// export default router;




import express from 'express';
import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus,
} from '../../../controllers/admin/Subject/subject.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Subject Management
 *   description: APIs for Managing Subjects within Courses
 */

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/subjects:
 *   post:
 *     summary: Create a new subject
 *     description: Create a subject and link it to a specific course.
 *     tags: [Admin Subject Management]
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
 *               - courseId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Anatomy"
 *               courseId:
 *                 type: string
 *                 description: The ID of the course this subject belongs to
 *               description:
 *                 type: string
 *                 example: "Study of human body structures"
 *               order:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input or subject already exists in this course
 */
router.post('/', createSubject);

/**
 * @swagger
 * /api/admin/subjects:
 *   get:
 *     summary: Get all subjects
 *     description: Fetch a list of all subjects. Can be filtered by courseId.
 *     tags: [Admin Subject Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional filter to get subjects of a specific course
 *     responses:
 *       200:
 *         description: List of subjects fetched successfully
 */
router.get('/', getAllSubjects);

/**
 * @swagger
 * /api/admin/subjects/{id}:
 *   get:
 *     summary: Get a single subject by ID
 *     tags: [Admin Subject Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the subject
 *     responses:
 *       200:
 *         description: Subject details fetched successfully
 *       404:
 *         description: Subject not found
 */
router.get('/:id', getSubjectById);

/**
 * @swagger
 * /api/admin/subjects/{id}:
 *   patch:
 *     summary: Update an existing subject
 *     tags: [Admin Subject Management]
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
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subject updated successfully
 */
router.patch('/:id', updateSubject);

/**
 * @swagger
 * /api/admin/subjects/{id}:
 *   delete:
 *     summary: Delete a subject (Soft Delete)
 *     description: Marks the subject as deleted without removing it from the database permanently.
 *     tags: [Admin Subject Management]
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
 *         description: Subject deleted successfully
 */
router.delete('/:id', deleteSubject);

/**
 * @swagger
 * /api/admin/subjects/{id}/status:
 *   patch:
 *     summary: Toggle subject status (Active/Inactive)
 *     tags: [Admin Subject Management]
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
router.patch('/:id/status', toggleSubjectStatus);

export default router;