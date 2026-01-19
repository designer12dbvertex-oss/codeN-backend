// import express from 'express';
// import { protect } from '../../../middleware/authMiddleware.js';
// import { authorize } from '../../../middleware/Authorization.middleware.js';

// import {
//   createTag,
//   getTags,
//   updateTag,
//   deleteTag,
// } from '../../../controllers/admin/Tags/tag.controller.js';
// const router = express.Router();

// router.use(protect);
// router.use(authorize('admin'));

// router.post('/', createTag); // create tag
// router.get('/', getTags); // get tags (by chapterId)
// router.patch('/:id', updateTag); // update tag
// router.delete('/:id', deleteTag); // delete tag

// export default router;



import express from 'express';
import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';

import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
} from '../../../controllers/admin/Tags/tag.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Tag Management
 *   description: APIs for managing Question Tags (e.g., PYQ, High Yield, AIIMS, NEET)
 */

// Sabhi routes protected hain aur sirf admin access kar sakta hai
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/tags:
 *   post:
 *     summary: Create a new tag
 *     description: Create a tag and link it to a specific chapter/topic.
 *     tags: [Admin Tag Management]
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
 *               - chapterId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "NEET 2023"
 *               chapterId:
 *                 type: string
 *                 description: The ID of the chapter this tag belongs to
 *               color:
 *                 type: string
 *                 description: Hex code for the tag color
 *                 example: "#FF5733"
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', createTag);

/**
 * @swagger
 * /api/admin/tags:
 *   get:
 *     summary: Get all tags
 *     description: Fetch a list of tags. Can be filtered by chapterId.
 *     tags: [Admin Tag Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *         description: Filter tags by a specific chapter ID
 *     responses:
 *       200:
 *         description: List of tags fetched successfully
 */
router.get('/', getTags);

/**
 * @swagger
 * /api/admin/tags/{id}:
 *   patch:
 *     summary: Update an existing tag
 *     tags: [Admin Tag Management]
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
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       404:
 *         description: Tag not found
 */
router.patch('/:id', updateTag);

/**
 * @swagger
 * /api/admin/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Admin Tag Management]
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
 *         description: Tag deleted successfully
 */
router.delete('/:id', deleteTag);

export default router;