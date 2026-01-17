import express from 'express';
import {
  changePassword,
  editProfileOfUser,
  forgetPassword,
  getSlugByQuery,
  getUserData,
  login,
  loginByGoogle,
  register,
  resendOtp,
  verifyEmail,
} from '../../controllers/user/userController.js';

import uploadProfile from '../../middleware/uploaduserProfile.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authLimiter } from '../../middleware/limiter.js';

const userRouter = express.Router();

/* ================= AUTH ================= */

// Google login
userRouter.post('/auth/google', authLimiter, loginByGoogle);

// Email registration flow
userRouter.post('/auth/register', authLimiter, register);
userRouter.post('/auth/verify-email', authLimiter, verifyEmail);
userRouter.post('/auth/resend-otp', authLimiter, resendOtp);
userRouter.post('/auth/login', authLimiter, login);

// Password recovery
userRouter.post('/auth/forgot-password', authLimiter, forgetPassword);
userRouter.post('/auth/change-password', authLimiter, changePassword);

/* ================= USER ================= */

// Edit profile
userRouter.patch(
  '/profile',
  protect,
  uploadProfile.single('image'),
  editProfileOfUser
);

// Get logged-in user data (secure)
userRouter.get('/profile/:id', protect, getUserData);

/* ================= CMS / STATIC ================= */

// Slug pages (privacy, terms, about)
userRouter.get('/slug', getSlugByQuery);

export default userRouter;
