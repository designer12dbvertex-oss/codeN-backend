import express from 'express';
import { createTopic, getTopicsByChapter,getAllTopics  } from '../../controllers/Topic/topic.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js';

const router = express.Router();

// Sabhi routes ko protect karein taaki sirf admin access kar sake
router.use(protect);
router.use(authorize('admin'));

// Route to create a new topic
router.post('/', createTopic);
router.get('/', getAllTopics);

// Route to get topics for a specific chapter (hierarchy: Chapter -> Topic)
router.get('/:chapterId', getTopicsByChapter);

export default router;