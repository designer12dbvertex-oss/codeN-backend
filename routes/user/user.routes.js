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
  verifyMobile,
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
  getChaptersByTopicForUser,
  // submitTestByChapter,
  getMe,
  getCourseListSimple,
  logout,
  updateVideoProgress,
  getDailyMCQ,
  getAllTagsForUsers,
  getChapterFullDetails,
  addBookmark,
  removeBookmark,
  getMyBookmarks,
  toggleBookmark,
  getBookmarkSummary,
  getBookmarksList,
  getUserDashboardStats,
  getfaculty,
  getAllTopicsCount,
} from '../../controllers/user/userController.js';

import { getAboutUs } from '../../controllers/admin/AboutUs/aboutus.controller.js';
import { getPrivacyPolicy } from '../../controllers/admin/PrivacyPolicy/privacy.controller.js';
import { getTerms } from '../../controllers/admin/Terms&Condition/terms.controller.js';
import {
  getChapterBySubSubjectId,
  getChapterByIdForUser,
} from '../../controllers/admin/Chapter/chapter.controller.js';

import uploadProfile from '../../middleware/uploaduserProfile.js';
import { protect } from '../../middleware/authMiddleware.js';

import {
  getChapterVideoByChapterId,
  getVideoData,
} from '../../controllers/admin/Video/video.controller.js';

import {
  getTopicsByChapterForUser,
  getTopicFullDetails,
  getChaptersWithTopicCountBySubSubject,
  getTopicVideosForUser,
  getCustomPracticeMCQs,
  resumeCustomTest,
  saveCustomAnswer,
  submitCustomTest,
  getCustomTestHistory,
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

userRouter.post('/register', register);
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
userRouter.post('/verify-mobile', otpLimiter, verifyMobile);

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
userRouter.get('/auth-me', protect, getMe);
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
userRouter.get('/chapter/:chapterId', getChapterByIdForUser);
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
userRouter.get('/alltag', getAllTagsForUsers);
userRouter.get('/details/:chapterId', protect, getChapterFullDetails);

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
userRouter.get('/sub-subjects', getSubSubjectsBySubject);

/**
 * @swagger
 * /api/users/chapters/subsubject/{subSubjectId}:
 *   get:
 *     summary: Get chapters by subSubjectId with total topics count
 *     tags: [Educational Content]
 *     parameters:
 *       - in: path
 *         name: subSubjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: SubSubject ID
 *     responses:
 *       200:
 *         description: Chapters fetched successfully
 *       400:
 *         description: Invalid subSubjectId
 */
userRouter.get(
  '/chapters/subsubject/:subSubjectId',
  protect,
  getChaptersWithTopicCountBySubSubject
);

userRouter.get(
  '/topics/chapter/:chapterId',
  protect,
  getTopicsByChapterForUser
);
userRouter.get('/topic-details/:topicId', protect, getTopicFullDetails);

userRouter.get('/get-chapters/:subSubjectId', getChapterBySubSubjectId);
userRouter.get('/topic-videos/:topicId', protect, getTopicVideosForUser);
userRouter.post('/update-progress', protect, updateVideoProgress);

userRouter.get('/daily-mcq', getDailyMCQ);

/* ================= MCQ / TEST ================= */

userRouter.get('/get-mcqs', protect, getMcqsByChapter);

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
userRouter.post('/submit-test', testLimiter, protect, submitTest);
// userRouter.post('/submit-Qtest', protect, submitTestByChapter);
/* ================= SUBSCRIPTION ROUTES ================= */

//custom test attempt routes
userRouter.post('/generate-custom-test', protect, getCustomPracticeMCQs);

userRouter.get('/custom-test/:attemptId', protect, resumeCustomTest);

userRouter.post('/save-custom-answer', protect, saveCustomAnswer);

userRouter.post('/submit-custom-test', protect, submitCustomTest);

userRouter.get('/custom-test-history', protect, getCustomTestHistory);

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

/**
 * @swagger
 * tags:
 *   name: User Bookmarks
 *   description: APIs for users to save/bookmark MCQs, Pearls, or Chapters for later review
 */

// Sabhi routes login protected hain

/**
 * @swagger
 * /api/bookmarks:
 *   post:
 *     summary: Add a new bookmark
 *     tags: [User Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - itemType
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the MCQ or Pearl being bookmarked
 *               itemType:
 *                 type: string
 *                 enum: [MCQ, Pearl]
 *                 description: Specify if the item is an MCQ or a Pearl
 *     responses:
 *       201:
 *         description: Bookmarked successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/', protect, addBookmark);

/**
 * @swagger
 * /api/bookmarks:
 *   delete:
 *     summary: Remove a bookmark
 *     tags: [User Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the bookmarked item to remove
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 */
userRouter.delete('/', removeBookmark);

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     summary: Get all bookmarked items of the logged-in user
 *     tags: [User Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarks fetched successfully
 */
userRouter.get('/', getMyBookmarks);

/**
 * @swagger
 * /api/bookmarks/toggle:
 *   post:
 *     summary: Toggle bookmark status (Add/Remove)
 *     description: If the item is already bookmarked, it will be removed. If not, it will be added.
 *     tags: [User Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *               itemType:
 *                 type: string
 *                 enum: [MCQ, Pearl]
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully
 */
// router.post('/toggle', toggleBookmark);
userRouter.post('/toggle', protect, toggleBookmark);
userRouter.get('/summary', protect, getBookmarkSummary);
userRouter.get('/list', protect, getBookmarksList);

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
userRouter.get('/dashboard-stats', protect, getUserDashboardStats);

userRouter.get('/profile/:id', protect, getUserData);
// userRouter.get('/:id', protect, getUserData);

/* ================= RATING ================= */

/**
 * @swagger
 * /api/users/rating:
 *   post:
 *     summary: Post or update rating for a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - videoId
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4
 *               review:
 *                 type: string
 *                 example: "Very helpful video"
 *               videoId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/rating', protect, postRating);
userRouter.get('/facultylist', getfaculty);
userRouter.get('/count-all-topics', getAllTopicsCount);

export default userRouter;
