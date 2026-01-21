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
  getSubjectsByUser,
  getAllsubjects,
  getSubSubjectsBySubject,
  getMcqsByChapter,
  submitTest,
  getActivePlans,
  getMySubscription,
  buySubscription,
  postRating,
  getAllSubSubjectsForUser,
} from '../../controllers/user/userController.js';
import { getAboutUs } from '../../controllers/admin/AboutUs/aboutus.controller.js';
import { getPrivacyPolicy } from '../../controllers/admin/PrivacyPolicy/privacy.controller.js';
import { getTerms } from '../../controllers/admin/Terms&Condition/terms.controller.js';
import { getChapterBySubSubjectId } from '../../controllers/admin/Chapter/chapter.controller.js';

import uploadProfile from '../../middleware/uploaduserProfile.js';
import { protect } from '../../middleware/authMiddleware.js';

import {
  getChapterVideoByChapterId,
  getVideoData,
} from '../../controllers/admin/Video/video.controller.js';
import {
  getAllTopicsForUser,
  getTopicsByChapterForUser,
  getSingleTopicForUser,
  getTopicsWithChaptersForUser,
} from '../../controllers/user/userController.js';

import { testLimiter, otpLimiter } from '../../middleware/limiter.js';
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Authentication & APIs
 */

const userRouter = express.Router();

/* ================= AUTH ================= */

// Google login
/**
 * @swagger
 * /api/users/google:
 *   post:
 *     summary: Login with Google
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Google login successful
 */

userRouter.post('/google', otpLimiter, loginByGoogle);

// Email registration flow
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - countryId
 *               - stateId
 *               - cityId
 *               - collegeId
 *               - classId
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *               countryId:
 *                 type: string
 *               stateId:
 *                 type: string
 *               cityId:
 *                 type: string
 *               collegeId:
 *                 type: string
 *               classId:
 *                 type: string
 *               admissionYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */

userRouter.post('/register', otpLimiter, register);
/**
 * @swagger
 * /api/users/verify-email:
 *   post:
 *     summary: Verify email using OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */

userRouter.post('/verify-email', otpLimiter, verifyEmail);

userRouter.post('/resend-otp', otpLimiter, resendOtp);
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

userRouter.post('/login', otpLimiter, login);

// Password recovery
userRouter.post('/forgot-password', otpLimiter, forgetPassword);
userRouter.post('/change-password', otpLimiter, changePassword);

/* ================= USER ================= */

// Video APIs
userRouter.get('/video/:videoId', getVideoData);
userRouter.get('/chapter/:chapterId/video', getChapterVideoByChapterId);

// Profile update
userRouter.patch(
  '/profile',
  protect,
  uploadProfile.single('image'),
  editProfileOfUser
);

// Get logged-in user data (secure)

/* ================= CMS / STATIC ================= */

// Slug pages (privacy, terms, about)
userRouter.get('/slug', getSlugByQuery);

/* ================= SUBJECT / SUB-SUBJECT ================= */

userRouter.get('/subjects', getSubjectsByUser);
userRouter.get('/get-all-subjects', getAllsubjects);
userRouter.get('/get-sub-subjects', getSubSubjectsBySubject);

/* ================= TOPIC / CHAPTER ================= */

userRouter.get(
  '/topics-with-chapters/sub-subject/:subSubjectId',
  getTopicsWithChaptersForUser
);

userRouter.get('/topics', getAllTopicsForUser);
userRouter.get('/topics/chapter/:chapterId', getTopicsByChapterForUser);
userRouter.get('/topics/:id', getSingleTopicForUser);
userRouter.get('/get-chapters/:subSubjectId', getChapterBySubSubjectId);

/* ================= MCQ / TEST ================= */

userRouter.get('/get-mcqs', getMcqsByChapter);
userRouter.post('/submit-test', testLimiter, submitTest);

userRouter.get('/get-plans', getActivePlans);
userRouter.get('/my-subscription', protect, getMySubscription);
/**
 * @swagger
 * /api/users/buy-plan:
 *   post:
 *     summary: Buy a subscription plan
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - months
 *               - paymentId
 *               - orderId
 *             properties:
 *               planId:
 *                 type: string
 *               months:
 *                 type: number
 *               paymentId:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription activated
 */

userRouter.post('/buy-plan', protect, buySubscription);
userRouter.get('/about-us', getAboutUs);
userRouter.get('/privacy-policy', getPrivacyPolicy);
userRouter.get('/terms-conditions', getTerms);
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get logged in user data
 *     tags: [User]
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
 *         description: User data fetched
 */

userRouter.get('/:id', protect, getUserData);
userRouter.get('/profile/:id', protect, getUserData);

export default userRouter;
