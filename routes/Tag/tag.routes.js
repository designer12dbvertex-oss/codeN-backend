import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';

import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
} from '../../controllers/Tag/tag.controller.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/', createTag); // create tag
router.get('/', getTags); // get tags (by chapterId)
router.patch('/:id', updateTag); // update tag
router.delete('/:id', deleteTag); // delete tag

export default router;
