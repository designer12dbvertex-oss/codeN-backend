import express from 'express';
import {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  toggleTopicStatus,
  deleteTopicPermanently,
  getTopicsByChapter,
} from '../../../controllers/admin/Topic/topic.controller.js';

import { protect } from '../../../middleware/authMiddleware.js';
import { authorize } from '../../../middleware/Authorization.middleware.js';

const router = express.Router();

// 🔐 Only admin access
router.use(protect);
router.use(authorize('admin'));

// CREATE TOPIC
router.post('/', createTopic);

// LIST ALL TOPICS
router.get('/', getAllTopics);

// LIST TOPICS BY CHAPTER (Hierarchy: Chapter → Topic)
router.get('/chapter/:chapterId', getTopicsByChapter);

// GET SINGLE TOPIC
router.get('/:id', getTopicById);

// UPDATE TOPIC
router.patch('/:id', updateTopic);

// TOGGLE STATUS (ACTIVE / INACTIVE)
router.patch('/:id/status', toggleTopicStatus);

// DELETE TOPIC (PERMANENT)
router.delete('/:id', deleteTopicPermanently);

export default router;
