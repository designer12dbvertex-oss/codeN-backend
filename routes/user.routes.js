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
} from '../controllers/userController.js';
import uploadProfile from '../middleware/uploaduserProfile.js';
import { protect } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

/*register by google */
userRouter.post('/google-login', loginByGoogle);

/*register mannual */
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/resend-otp', resendOtp);
userRouter.post('/register', register);
userRouter.post('/login', login);

/*  user details api */
userRouter.patch(
  '/edit',
  protect,
  uploadProfile.single('image'),
  editProfileOfUser
);
userRouter.get('/:id', protect, getUserData);

/*forgot password */
userRouter.post('/forget-password', forgetPassword);
userRouter.post('/change-password', changePassword);

/* get slug api privacy policy term condition about us */
userRouter.get('/slug', getSlugByQuery);

export default userRouter;
