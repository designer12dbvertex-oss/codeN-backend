// import express from 'express';
// import {
//   createClass,
//   getAllClasses,
//   updateClass,
//   deleteClass,
// } from '../../controllers/admin/class.controller.js';
// import { protect } from '../../middleware/authMiddleware.js';

// const router = express.Router();

// router.post('/', protect, createClass); // CREATE
// router.get('/', protect, getAllClasses); // READ
// router.put('/:id', protect, updateClass); // UPDATE
// router.delete('/:id', protect, deleteClass); // DELETE

// export default router;


import express from 'express';
import {
  createClass,
  getAllClasses,
  updateClass,
  deleteClass,
} from '../../controllers/admin/class.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Class Management
 *   description: APIs for managing Classes (e.g., Grade 10, Medical, Engineering)
 */

/**
 * @swagger
 * /api/admin/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Admin Class Management]
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
 *                 description: Name of the class
 *                 example: "Medical Entrance"
 *               description:
 *                 type: string
 *                 description: Short detail about the class
 *     responses:
 *       201:
 *         description: Class created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, createClass); // CREATE

/**
 * @swagger
 * /api/admin/classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Admin Class Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all classes fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getAllClasses); // READ

/**
 * @swagger
 * /api/admin/classes/{id}:
 *   put:
 *     summary: Update an existing class
 *     tags: [Admin Class Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the class
 *     requestBody:
 *       required: true
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
 *         description: Class updated successfully
 *       404:
 *         description: Class not found
 */
router.put('/:id', protect, updateClass); // UPDATE

/**
 * @swagger
 * /api/admin/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags: [Admin Class Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the class to delete
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       404:
 *         description: Class not found
 */
router.delete('/:id', protect, deleteClass); // DELETE

export default router;
