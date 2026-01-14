import express from 'express';
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
  toggleBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addBookmark);
router.delete('/', protect, removeBookmark);
router.get('/', protect, getMyBookmarks);
router.post('/toggle', protect, toggleBookmark);

export default router;
