import express from 'express';
import {
  addSlug,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAllUsers,
} from '../../controllers/admin/admin.controller.js';
import upload from '../../middleware/upload.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Require a valid admin token header for login attempts
router.post('/login', loginAdmin);

// Get logged-in admin profile
router.get('/profile', protect, getAdminProfile);

// Update admin profile (name, phone, image)
router.put(
  '/profile',
  protect,
  upload.single('profileImage'),
  updateAdminProfile
);
// 👇 existing routes ke neeche add karo
router.get('/users', protect, getAllUsers);
// Change admin password
router.put('/change-password', protect, changeAdminPassword);

/*        slug api like privacy-policy, term condition, about us */
router.post('/slug', addSlug);

export default router;
