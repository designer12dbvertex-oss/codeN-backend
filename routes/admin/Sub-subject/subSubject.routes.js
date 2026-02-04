// import express from 'express';
// import { protect } from '../../../middleware/authMiddleware.js';
// import { authorize } from '../../../middleware/Authorization.middleware.js';
// import {
//   createSubSubject,
//   getAllSubSubjects,
//   getSubSubjectById,
//   updateSubSubject,
//   deleteSubSubject,
//   toggleSubSubjectStatus,
// } from '../../../controllers/admin/Sub-subject/subSubject.controller.js';

// const router = express.Router();

// // All routes are protected and require admin role
// router.use(protect);
// router.use(authorize('admin'));

// // Create sub-subject
// router.post('/', createSubSubject);

// // Get all sub-subjects
// router.get('/', getAllSubSubjects);

// // Get single sub-subject
// router.get('/:id', getSubSubjectById);

// // Update sub-subject
// router.patch('/:id', updateSubSubject);

// // Delete sub-subject (soft delete)
// router.delete('/:id', deleteSubSubject);

// // Toggle sub-subject status (enable/disable)
// router.patch('/:id/status', toggleSubSubjectStatus);

// export default router;



import express from 'express';
import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';
import {
  createSubSubject,
  getAllSubSubjects,
  getSubSubjectById,
  updateSubSubject,
  deleteSubSubject,
  toggleSubSubjectStatus,
} from '../../../controllers/admin/Sub-subject/subSubject.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Sub-Subject Management
 *   description: APIs for Managing Sub-Subjects under Subjects
 */

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/sub-subjects:
 *   post:
 *     summary: Create a new sub-subject
 *     tags: [Admin Sub-Subject Management]
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
 *               - subjectId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cardiology"
 *               courseId:
 *                 type: string
 *                 description: ID of the parent course
 *               subjectId:
 *                 type: string
 *                 description: ID of the parent subject
 *               order:
 *                 type: number
 *                 default: 0
 *     responses:
 *       201:
 *         description: Sub-subject created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', createSubSubject);

/**
 * @swagger
 * /api/admin/sub-subjects:
 *   get:
 *     summary: Get all sub-subjects
 *     tags: [Admin Sub-Subject Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *         description: Filter sub-subjects by a specific subject ID
 *     responses:
 *       200:
 *         description: List of sub-subjects fetched successfully
 */
router.get('/', getAllSubSubjects);

/**
 * @swagger
 * /api/admin/sub-subjects/{id}:
 *   get:
 *     summary: Get a single sub-subject by ID
 *     tags: [Admin Sub-Subject Management]
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
 *         description: Sub-subject details fetched successfully
 *       404:
 *         description: Sub-subject not found
 */
router.get('/:id', getSubSubjectById);

/**
 * @swagger
 * /api/admin/sub-subjects/{id}:
 *   patch:
 *     summary: Update an existing sub-subject
 *     tags: [Admin Sub-Subject Management]
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
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Sub-subject updated successfully
 */
router.patch('/:id', updateSubSubject);

/**
 * @swagger
 * /api/admin/sub-subjects/{id}:
 *   delete:
 *     summary: Delete a sub-subject (Soft Delete)
 *     tags: [Admin Sub-Subject Management]
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
 *         description: Sub-subject deleted successfully
 */
router.delete('/:id', deleteSubSubject);

/**
 * @swagger
 * /api/admin/sub-subjects/{id}/status:
 *   patch:
 *     summary: Toggle sub-subject status (Active/Inactive)
 *     tags: [Admin Sub-Subject Management]
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
router.patch('/:id/status', toggleSubSubjectStatus);

export default router;