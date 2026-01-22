// import express from 'express';
// import {
//   changePassword,
//   editProfileOfUser,
//   forgetPassword,
//   getSlugByQuery,
//   getUserData,
//   login,
//   loginByGoogle,
//   register,
//   resendOtp,
//   verifyEmail,
//   getSubjectsByUser,
//   getAllsubjects,
//   getSubSubjectsBySubject,
//   getMcqsByChapter,
//   submitTest,
//   getActivePlans,
//   getMySubscription,
//   buySubscription,
//   postRating,
//   getAllSubSubjectsForUser,
// } from '../../controllers/user/userController.js';
// import { getAboutUs } from '../../controllers/admin/AboutUs/aboutus.controller.js';
// import { getPrivacyPolicy } from '../../controllers/admin/PrivacyPolicy/privacy.controller.js';
// import { getTerms } from '../../controllers/admin/Terms&Condition/terms.controller.js';
// import { getChapterBySubSubjectId } from '../../controllers/admin/Chapter/chapter.controller.js';

// import uploadProfile from '../../middleware/uploaduserProfile.js';
// import { protect } from '../../middleware/authMiddleware.js';

// import {
//   getChapterVideoByChapterId,
//   getVideoData,
// } from '../../controllers/admin/Video/video.controller.js';
// import {
//   getAllTopicsForUser,
//   getTopicsByChapterForUser,
//   getSingleTopicForUser,
//   getTopicsWithChaptersForUser,
// } from '../../controllers/user/userController.js';

// import { testLimiter, otpLimiter } from '../../middleware/limiter.js';

// const userRouter = express.Router();

// /* ================= AUTH ================= */

// // Google login
// userRouter.post('/google', otpLimiter, loginByGoogle);

// // Email registration flow
// userRouter.post('/register', otpLimiter, register);
// userRouter.post('/verify-email', otpLimiter, verifyEmail);
// userRouter.post('/resend-otp', otpLimiter, resendOtp);
// userRouter.post('/login', otpLimiter, login);

// // Password recovery
// userRouter.post('/forgot-password', otpLimiter, forgetPassword);
// userRouter.post('/change-password', otpLimiter, changePassword);

// /* ================= USER ================= */

// // Video APIs
// userRouter.get('/video/:videoId', getVideoData);
// userRouter.get('/chapter/:chapterId/video', getChapterVideoByChapterId);

// // Profile update
// userRouter.patch(
//   '/profile',
//   protect,
//   uploadProfile.single('image'),
//   editProfileOfUser
// );

// // Get logged-in user data (secure)

// /* ================= CMS / STATIC ================= */

// // Slug pages (privacy, terms, about)
// userRouter.get('/slug', getSlugByQuery);

// /* ================= SUBJECT / SUB-SUBJECT ================= */

// userRouter.get('/subjects', getSubjectsByUser);
// userRouter.get('/get-all-subjects', getAllsubjects);
// userRouter.get('/get-sub-subjects', getSubSubjectsBySubject);

// /* ================= TOPIC / CHAPTER ================= */

// userRouter.get(
//   '/topics-with-chapters/sub-subject/:subSubjectId',
//   getTopicsWithChaptersForUser
// );

// userRouter.get('/topics', getAllTopicsForUser);
// userRouter.get('/topics/chapter/:chapterId', getTopicsByChapterForUser);
// userRouter.get('/topics/:id', getSingleTopicForUser);
// userRouter.get("/get-chapters/:subSubjectId", getChapterBySubSubjectId);

// /* ================= MCQ / TEST ================= */

// userRouter.get('/get-mcqs', getMcqsByChapter);
// userRouter.post('/submit-test', testLimiter, submitTest);

// userRouter.get('/get-plans', getActivePlans);
// userRouter.get('/my-subscription', protect, getMySubscription);
// userRouter.post('/buy-plan', protect, buySubscription);
// userRouter.get('/about-us', getAboutUs);
// userRouter.get('/privacy-policy', getPrivacyPolicy);
// userRouter.get('/terms-conditions', getTerms);
// userRouter.get('/:id', protect, getUserData);
// userRouter.get('/profile/:id', protect, getUserData);

// export default userRouter;

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
  getCourseListSimple,
  logout,
   updateVideoProgress,
  getDailyMCQ
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
  getTopicVideosForUser,
  getCustomPracticeMCQs
} from '../../controllers/user/userController.js';

import { testLimiter, otpLimiter } from '../../middleware/limiter.js';
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Authentication & APIs
 */
/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: User Video APIs
 */

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User Authentication
 *     description: Registration, Login, and Password management
 *   - name: User Profile
 *     description: User details and profile updates
 *   - name: Educational Content
 *     description: Subjects, Sub-subjects, Topics, and Chapters
 *   - name: MCQs & Tests
 *     description: Practice questions and test submissions
 *   - name: Videos
 *     description: Video lectures and related data
 *   - name: Subscription & Plans
 *     description: Management of user plans and purchases
 *   - name: CMS & Settings
 *     description: About us, Privacy, and Terms
 */

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

userRouter.post('/google', loginByGoogle);

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

userRouter.post('/login', login);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user and invalidate token
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/logout', protect, logout);

userRouter.post('/forgot-password', otpLimiter, forgetPassword);
userRouter.post('/change-password', otpLimiter, changePassword);

/* ================= USER ================= */
/**
 * @swagger
 * /api/users/video/{videoId}:
 *   get:
 *     summary: Get single video details
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video detail
 *       404:
 *         description: Video not found
 */
userRouter.get('/video/:videoId', getVideoData);
/**
 * @swagger
 * /api/users/chapter/{chapterId}/video:
 *   get:
 *     summary: Get all videos of a chapter
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *     responses:
 *       200:
 *         description: List of videos
 */
userRouter.get('/chapter/:chapterId/video', getChapterVideoByChapterId);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update logged-in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
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
 *               passingYear:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: No valid fields provided for update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

userRouter.patch(
  '/profile',
  protect,
  uploadProfile.single('image'),
  editProfileOfUser
);

/* ================= CMS / STATIC ================= */

userRouter.get('/slug', getSlugByQuery);
userRouter.get('/about-us', getAboutUs);
userRouter.get('/privacy-policy', getPrivacyPolicy);
userRouter.get('/terms-conditions', getTerms);

/* ================= EDUCATIONAL CONTENT ================= */

/**
 * @swagger
 * /api/users/subjects:
 *   get:
 *     summary: Get subjects by courseId
 *     tags: [Educational Content]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 */
userRouter.get('/subjects', getSubjectsByUser);

userRouter.get('/get-all-subjects', getAllsubjects);

/**
 * @swagger
 * /api/users/get-sub-subjects:
 *   get:
 *     summary: Get sub-subjects by subjectId
 *     tags: [Educational Content]
 *     parameters:
 *       - in: query
 *         name: subjectId
 *         required: true
 *         schema: { type: string }
 */
userRouter.get('/get-sub-subjects', getSubSubjectsBySubject);

userRouter.get(
  '/topics-with-chapters/sub-subject/:subSubjectId',
  getTopicsWithChaptersForUser
);

userRouter.get('/topics', getAllTopicsForUser);
userRouter.get('/topics/chapter/:chapterId', getTopicsByChapterForUser);
userRouter.get('/topics/:id', getSingleTopicForUser);
userRouter.get('/get-chapters/:subSubjectId', getChapterBySubSubjectId);
userRouter.get('/topic-videos/:topicId', protect,getTopicVideosForUser);
userRouter.post('/update-progress', protect, updateVideoProgress);
userRouter.post('/generate-custom-test',getCustomPracticeMCQs);
userRouter.get('/daily-mcq', getDailyMCQ);

/* ================= MCQ / TEST ================= */

userRouter.get('/get-mcqs', getMcqsByChapter);

/**
 * @swagger
 * /api/users/submit-test:
 *   post:
 *     summary: Submit a test and get results
 *     tags: [MCQs & Tests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chapterId: { type: string }
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 */
userRouter.post('/submit-test', testLimiter, submitTest);

/* ================= SUBSCRIPTION ROUTES ================= */

userRouter.get('/get-plans', getActivePlans);

/**
 * @swagger
 * /api/users/my-subscription:
 *   get:
 *     summary: Get logged-in user subscription
 *     tags: [Subscription & Plans]
 *     security:
 *       - bearerAuth: []
 */
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
userRouter.get('/list', getCourseListSimple);
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get logged-in user profile data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logged-in user ID
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     address:
 *                       type: string
 *                     countryId:
 *                       type: string
 *                     stateId:
 *                       type: string
 *                     cityId:
 *                       type: string
 *                     collegeId:
 *                       type: string
 *                     classId:
 *                       type: string
 *                     admissionYear:
 *                       type: string
 *                     passingYear:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *       400:
 *         description: Invalid user id
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */

userRouter.get('/profile/:id', protect, getUserData);
// userRouter.get('/:id', protect, getUserData);

export default userRouter;
