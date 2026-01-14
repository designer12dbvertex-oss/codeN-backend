import express from 'express';
import {
  createTest,
  publishTest,
} from '../../controllers/admin/testController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTest);
router.patch('/:id/publish', protect, publishTest);

export default router;
