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
    
} from '../../controllers/user/userController.js';
import { getAboutUs } from '../../controllers/admin/AboutUs/aboutus.controller.js'
import { getPrivacyPolicy } from '../../controllers/admin/PrivacyPolicy/privacy.controller.js';
import {getTerms} from "../../controllers/admin/Terms&Condition/terms.controller.js"

import uploadProfile from '../../middleware/uploaduserProfile.js';
import { protect } from '../../middleware/authMiddleware.js';
import { authLimiter } from '../../middleware/limiter.js';

import { getAllSubjects } from '../../controllers/admin/Subject/subject.controller.js';
import { getSubSubjectsById } from '../../controllers/admin/Sub-subject/subSubject.controller.js';
import { getChapterBySubSubjectId } from '../../controllers/admin/Chapter/chapter.controller.js';
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
const userRouter = express.Router();

/* ================= AUTH ================= */

// Google login
userRouter.post('/google', authLimiter, loginByGoogle);

// Email registration flow
userRouter.post('/register', authLimiter, register);
userRouter.post('/verify-email', authLimiter, verifyEmail);
userRouter.post('/resend-otp', authLimiter, resendOtp);
userRouter.post('/login', authLimiter, login);

// Password recovery
userRouter.post('/forgot-password', authLimiter, forgetPassword);
userRouter.post('/change-password', authLimiter, changePassword);

/* ================= USER ================= */

// Edit profile
/*========================video get api================== */
userRouter.get('/video/:videoId', getVideoData);
userRouter.get('/chapter/:chapterId/video', getChapterVideoByChapterId);
userRouter.get('/sub-subject/:subSubjectId/chapter', getChapterBySubSubjectId);
userRouter.get('/subject/:subjectId/sub-subject', getSubSubjectsById);
userRouter.get('/subjects', getAllSubjects);

/*  user details api */
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

userRouter.get('/get-subjects', getSubjectsByUser);
userRouter.get('/get-all-subjects', getAllsubjects);

userRouter.get('/get-sub-subjects', getSubSubjectsBySubject);

/* ================= TOPIC (USER) ================= */
userRouter.get(
  '/topics-with-chapters/sub-subject/:subSubjectId',
  getTopicsWithChaptersForUser
);
userRouter.get('/topics', getAllTopicsForUser);
userRouter.get('/topics/chapter/:chapterId', getTopicsByChapterForUser);
userRouter.get('/topics/:id', getSingleTopicForUser);

userRouter.get('/get-mcqs', getMcqsByChapter);
userRouter.post('/submit-test', submitTest);


userRouter.get("/get-plans", getActivePlans)
userRouter.get("/my-subscription",protect, getMySubscription);
userRouter.post("/buy-plan",protect,buySubscription);
userRouter.get("/about-us", getAboutUs);
userRouter.get("/privacy-policy", getPrivacyPolicy);
userRouter.get("/terms-conditions", getTerms);
userRouter.get('/:id', protect, getUserData); 
userRouter.get('/profile/:id', protect, getUserData);

export default userRouter;
