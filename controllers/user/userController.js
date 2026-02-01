import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import UserModel from '../../models/user/userModel.js';
import { sendFormEmail } from '../../config/mail.js';
import PageModel from '../../models/admin/pageModel.js';
import generateToken from '../../config/generateToken.js';
import Country from '../../models/admin/country.model.js';
import State from '../../models/admin/state.model.js';
import City from '../../models/admin/city.model.js';
import College from '../../models/admin/college.model.js';
import ClassModel from '../../models/admin/Class/class.model.js';
import Subject from '../../models/admin/Subject/subject.model.js';
import SubSubject from '../../models/admin/Sub-subject/subSubject.model.js';
import Topic from '../../models/admin/Topic/topic.model.js';
import Chapter from '../../models/admin/Chapter/chapter.model.js';
import MCQ from '../../models/admin/MCQs/mcq.model.js';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import SubscriptionPlan from '../../models/admin/SubscriptionPlan/scriptionplan.model.js';
import TransactionModel from '../../models/admin/Transaction/Transaction.js';
import Rating from '../../models/admin/Rating.js';
import Course from '../../models/admin/Course/course.model.js';
import Video from '../../models/admin/Video/video.model.js';
import VideoProgress from '../../models/admin/Video/videoprogess.js';
import Tag from '../../models/admin/Tags/tag.model.js';
import TestAttempt from '../../models/user/testAttemptModel.js';
import Bookmark from '../../models/admin/bookmarkModel.js';
import admin from 'firebase-admin';

const updateUserChapterProgress = async (userId, chapterId) => {
  const user = await UserModel.findById(userId);

  // Agar user nahi milta ya chapter pehle se added hai, toh purana count return karo
  if (!user || user.completedChapters.includes(chapterId)) {
    return user ? user.completedModulesCount : 0;
  }

  // Agar naya chapter hai toh update karo
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      $addToSet: { completedChapters: chapterId },
      $inc: { completedModulesCount: 1 },
    },
    { new: true }
  );

  return updatedUser.completedModulesCount;
};

//working krishna
// export const loginByGoogle = async (req, res, next) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({ message: 'Google ID token is required' });
//     }

//     // ✅ REAL TOKEN VERIFY
//     // ✅ SECURE TOKEN VERIFY (NO GOOGLE HTTP CALL)
//     let payload;

//     try {
//       const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: process.env.GOOGLE_CLIENT_ID,
//       });

//       payload = ticket.getPayload();
//     } catch (err) {
//       return res.status(401).json({ message: 'Invalid Google token' });
//     }

//     if (!payload?.email || !payload?.sub) {
//       return res.status(400).json({ message: 'Invalid Google token payload' });
//     }

//     const email = payload.email.toLowerCase().trim();
//     const googleId = payload.sub;
//     const name = payload.name || 'Google User';
//     const picture = payload.picture || null; // 👈 GOOGLE PROFILE IMAGE

//     let user = await UserModel.findOne({ email });

//     if (!user) {
//       user = await UserModel.create({
//         name,
//         email,
//         googleId,
//         profileImage: picture,
//         signUpBy: 'google',
//         isEmailVerified: true,
//         isMobileVerified: false,
//         role: 'user',
//       });
//     } else {
//       if (!user.googleId) user.googleId = googleId;

//       if (!user.profileImage && picture) {
//         user.profileImage = picture; // 👈 ADD THIS
//       }
//       if (user.signUpBy === 'email' && !user.isEmailVerified) {
//         user.isEmailVerified = true;
//         user.signUpBy = 'google';
//       }
//       await user.save();
//     }

//     if (user.status !== 'active') {
//       return res
//         .status(403)
//         .json({ message: 'Account is blocked or inactive' });
//     }

//     const { accessToken, refreshToken } = generateToken(user._id); // updated below
//     // 🔽 ADD THIS
//     user.refreshToken = refreshToken;
//     await user.save();
//     const safeUser = user.toObject();
//     delete safeUser.password;
//     delete safeUser.otp;
//     delete safeUser.otpExpiresAt;
//     delete safeUser.refreshToken;

//     return res.status(200).json({
//       accessToken,
//       refreshToken,
//       user: safeUser,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const loginByGoogle = async (req, res, next) => {
  console.log('Server time before verify:', new Date().toISOString());
  try {
    const { token } = req.body;
    console.log('Incoming Token:', token ? 'Token Received' : 'No Token');

    if (!token) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }
    console.log('Token Length:', token.length);
    console.log('Token Starts With:', token.substring(0, 10));
    let decodedToken;
    try {
      // Backend project ID log kar rahe hain verify karne ke liye
      const currentProjectId = admin.app().options.projectId;
      console.log('🔍 Verifying token for project:', currentProjectId);
      console.log('Token Length:', token.length);
      console.log('Token Starts With:', token.substring(0, 10));
      // Firebase Token Verify karna
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log('✅ Token VERIFIED successfully!');
      console.log('Decoded UID:', decodedToken.uid);
      console.log('Decoded email:', decodedToken.email);
      console.log('Full payload:', JSON.stringify(decodedToken, null, 2));
    } catch (err) {
      console.error('❌ VERIFY ERROR DETAILS:');
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);
      return res.status(401).json({
        message: 'Invalid or Expired Firebase Token',
        error_detail: err.message,
      });
    }

    // Yahan tak tabhi pahunchega jab token SUCCESSFUL verify ho chuka ho
    const email = decodedToken.email?.toLowerCase().trim();
    const googleId = decodedToken.uid;
    const name = decodedToken.name || 'Google User';
    const picture = decodedToken.picture || null;

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Invalid Google token payload: Email missing' });
    }

    // --- Database Logic ---
    let user = await UserModel.findOne({ email });

    if (!user) {
      // Naya User Banana
      user = await UserModel.create({
        name,
        email,
        googleId,
        profileImage: picture,
        signUpBy: 'google',
        isEmailVerified: true,
        role: 'user',
      });
      console.log('🆕 New User Created via Google Sign-In');
    } else {
      // Existing User Update karna
      let isUpdated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        isUpdated = true;
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        isUpdated = true;
      }

      if (isUpdated) await user.save();
      console.log('🏠 Existing User Logged In');
    }

    // JWT Token generation (Backend specific)
    const { accessToken, refreshToken } = generateToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password; // Password agar ho toh security ke liye delete karein
    delete safeUser.refreshToken;

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (err) {
    console.error('🔥 Global Google Login Error:', err);
    return res.status(500).json({
      message: 'Internal Server Error during Google Login',
      error_detail: err.message,
    });
  }
};
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      mobile,
      address,
      countryName, // 👈 user se aayega
      stateId,
      cityId,
      collegeName,
      classId,
      admissionYear,
      password,
    } = req.body;

    let finalClassId = classId;
    if (finalClassId === '') finalClassId = null;

    // 1️⃣ Basic Validation
    if (
      !name ||
      !email ||
      !password ||
      // !countryName ||
      !stateId ||
      !cityId ||
      !collegeName
    ) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          'All fields (Name, Email, Password, Country, State, City, College Name) are required.',
      });
    }

    // 2️⃣ COUNTRY AUTO FIND-OR-CREATE
    let country = null;
    let countryId = null;

    if (countryName && countryName.trim() !== '') {
      country = await Country.findOne({
        name: { $regex: new RegExp(`^${countryName.trim()}$`, 'i') },
      });

      if (!country) {
        const [createdCountry] = await Country.create(
          [
            {
              name: countryName.trim(),
              isActive: true,
            },
          ],
          { session }
        );
        country = createdCountry;
      }

      if (!country.isActive) {
        country.isActive = true;
        await country.save({ session });
      }

      countryId = country._id;
    }

    // 3️⃣ STATE VALIDATION (NO countryId)
    const activeState = await State.findOne({
      _id: stateId,
      isActive: true,
    });

    if (!activeState) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Selected state is not active.',
      });
    }

    // 4️⃣ CITY VALIDATION (ONLY stateId)
    const cityExists = await City.findOne({
      _id: cityId,
      stateId: stateId,
    });

    if (!cityExists) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid city selection for this state.',
      });
    }

    // 5️⃣ Dynamic College Logic
    let college = await College.findOne({
      name: { $regex: new RegExp(`^${collegeName.trim()}$`, 'i') },
      cityId,
    }).session(session);

    if (!college) {
      const createdColleges = await College.create(
        [
          {
            name: collegeName.trim(),
            cityId,
            stateId,
            isActive: true,
          },
        ],
        { session }
      );
      college = createdColleges[0];
    }

    // 6️⃣ Class Validation
    if (finalClassId) {
      const classExists = await ClassModel.findById(finalClassId);
      if (!classExists) {
        if (session.inTransaction()) await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ success: false, message: 'Invalid class selected.' });
      }
    }

    // 7️⃣ Password & User Existence
    if (password.length < 6) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (mobile) {
      const mobileExists = await UserModel.findOne({ mobile });
      if (mobileExists) {
        if (session.inTransaction()) await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'User already exists with this mobile number.',
        });
      }
    }

    if (existingUser) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.',
      });
    }

    const emailOtp = generateOtp();
    const now = new Date();

    // const mobileOtp = generateOtp();

    const [user] = await UserModel.create(
      [
        {
          name,
          email: normalizedEmail,
          password,
          otp: emailOtp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          lastOtpSentAt: now,
          // mobile,
          // mobileOtp,
          // mobileOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          mobile,
          isMobileVerified: true, // ✅ auto-verify mobile
          address,
          countryId,
          stateId,
          cityId,
          collegeId: college._id,
          classId: finalClassId,
          admissionYear,
          signUpBy: 'email',
          role: 'user',
        },
      ],
      { session }
    );

    // 9️⃣ Commit and Cleanup
    await session.commitTransaction();
    session.endSession();
    await sendFormEmail(normalizedEmail, emailOtp);

    // 🔽 TEMP: CONSOLE MOBILE OTP
    // console.log(`📱 Mobile OTP for ${mobile}: ${mobileOtp}`);

    /*
==============================
 HERE PAID SMS SERVICE CODE AAYEGA
 e.g. Twilio / MSG91 / Fast2SMS
==============================
await sendSms(mobile, `Your OTP is ${mobileOtp}`);
*/

    // 🔟 Populate for Response
    const populatedUser = await UserModel.findById(user._id)
      .populate('countryId', 'name')
      .populate('stateId', 'name')
      .populate('cityId', 'name')
      .populate('collegeId', 'name')
      .populate('classId', 'name');

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: populatedUser,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ basic validation
    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
      });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified',
      });
    }

    // ✅ OTP + expiry check
    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    // ✅ activate user
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // ✅ block/inactive check before issuing token
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is blocked or inactive',
      });
    }

    // const { accessToken, refreshToken } = generateToken(user._id);

    // ✅ safe user object
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
    };

    res.json({
      message: 'Email verified successfully',
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyMobile = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile and OTP are required' });
    }

    const user = await UserModel.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isMobileVerified) {
      return res.status(400).json({ message: 'Mobile already verified' });
    }

    if (
      !user.mobileOtp ||
      user.mobileOtp !== otp ||
      !user.mobileOtpExpiresAt ||
      user.mobileOtpExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isMobileVerified = true;
    user.mobileOtp = null;
    user.mobileOtpExpiresAt = null;
    await user.save();

    return res.json({ message: 'Mobile verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, mobile, password } = req.body;
    if (email && mobile) {
      return res.status(400).json({
        message: 'Use either email or mobile, not both',
      });
    }

    if ((!email && !mobile) || !password) {
      return res.status(400).json({
        message: 'Email or Mobile and password are required',
      });
    }

    let user;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await UserModel.findOne({ email: normalizedEmail })
        .select('+password')
        .populate('collegeId', 'name') // 🔥 College ka naam lene ke liye
        .populate('stateId', 'name') // 🔥 State ka naam lene ke liye
        .populate('cityId', 'name');
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!user.isEmailVerified)
        return res.status(401).json({ message: 'Email not verified' });
    }

    // if (mobile) {
    //   user = await UserModel.findOne({ mobile }).select('+password');
    //   if (!user) return res.status(404).json({ message: 'User not found' });
    //   if (!user.isMobileVerified)
    //     return res.status(401).json({ message: 'Mobile not verified' });
    // }

    if (mobile) {
      user = await UserModel.findOne({ mobile }).select('+password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      // ✅ mobile verification check removed
    }

    if (user.status !== 'active') {
      return res
        .status(403)
        .json({ message: 'Account is blocked or inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpiresAt;
    delete safeUser.mobileOtp;
    delete safeUser.mobileOtpExpiresAt;
    delete safeUser.refreshToken;

    res.json({
      message: 'Login successful',
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email, mobile } = req.body;

    // 1️⃣ Input validation
    if (!email && !mobile) {
      return res.status(400).json({
        message: 'Email or mobile is required',
      });
    }

    let user = null;
    let mode = null; // "email" | "mobile"

    // 2️⃣ Find user by email or mobile
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await UserModel.findOne({ email: normalizedEmail });
      mode = 'email';
    }

    if (!user && mobile) {
      user = await UserModel.findOne({ mobile });
      mode = 'mobile';
    }

    // 3️⃣ Anti user-enumeration
    if (!user) {
      return res.status(200).json({
        message: 'If this account exists, an OTP has been sent',
      });
    }

    // 4️⃣ Already verified checks (mode-wise)
    if (mode === 'email' && user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email already verified',
      });
    }

    if (mode === 'mobile' && user.isMobileVerified) {
      return res.status(400).json({
        message: 'Mobile already verified',
      });
    }

    // 5️⃣ Cooldown (1 minute)
    const now = Date.now();

    if (user.lastOtpSentAt && now - user.lastOtpSentAt.getTime() < 60 * 1000) {
      const remaining =
        60 - Math.floor((now - user.lastOtpSentAt.getTime()) / 1000);

      return res.status(429).json({
        message: `Please wait ${remaining} seconds before requesting another OTP`,
        retryAfterSeconds: remaining,
      });
    }

    // 6️⃣ Generate OTPs
    const emailOtp = generateOtp();
    // const mobileOtp = generateOtp();

    // 7️⃣ Save OTPs
    user.otp = emailOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.lastOtpSentAt = new Date();

    // user.mobileOtp = mobileOtp;
    // user.mobileOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 8️⃣ Send based on mode
    if (mode === 'email') {
      await sendFormEmail(user.email, emailOtp);
    }

    // if (mode === 'mobile') {
    //   // 🔽 TEMP: CONSOLE MOBILE OTP
    //   console.log(`📱 Resent Mobile OTP for ${user.mobile}: ${mobileOtp}`);

    //   /*
    //     HERE PAID SMS CODE AAYEGA
    //     await sendSms(user.mobile, `Your OTP is ${mobileOtp}`);
    //   */
    // }

    await user.save();

    // 9️⃣ Mode-wise response message
    return res.json({
      message:
        mode === 'email'
          ? 'Email OTP resent successfully'
          : 'Mobile OTP resent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ ADD: input validation
    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });

    // ✅ ADD: generic response (anti user-enumeration)
    if (!user) {
      return res.status(200).json({
        message: 'If this email exists, an OTP has been sent',
      });
    }

    // ✅ ADD: only verified users can reset password
    if (!user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is not verified',
      });
    }

    const now = Date.now();

    if (user.lastOtpSentAt && now - user.lastOtpSentAt.getTime() < 60 * 1000) {
      const remaining =
        60 - Math.floor((now - user.lastOtpSentAt.getTime()) / 1000);

      return res.status(429).json({
        message: `Please wait ${remaining} seconds before requesting another OTP`,
        retryAfterSeconds: remaining,
      });
    }

    const emailOtp = generateOtp();
    const mobileOtp = generateOtp();

    user.otp = emailOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.lastOtpSentAt = new Date();
    user.mobileOtp = mobileOtp;
    user.mobileOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sendFormEmail(user.email, emailOtp);

    // 🔽 TEMP: CONSOLE MOBILE OTP
    console.log(`📱 Resent Mobile OTP for ${user.mobile}: ${mobileOtp}`);

    /*
 HERE PAID SMS CODE AAYEGA
*/

    await user.save();

    res.status(200).json({
      message: 'If this email exists, an OTP has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ ADD: input validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: 'Email, OTP and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await UserModel.findOne({ email: normalizedEmail }).select(
      '+password'
    );

    // ✅ ADD: generic response
    if (!user) {
      return res.status(400).json({
        message: 'Invalid OTP or request expired',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is blocked or inactive',
      });
    }

    // ✅ SAFE OTP check
    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    // ✅ PREVENT old password reuse
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password must be different from old password',
      });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // DB se token remove karo
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        refreshToken: null, // ya token field jo tum use kar rahe ho
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user protect middleware se aata hai
    const user = await UserModel.findById(req.user._id)
      .select('-password -otp -otpExpiresAt -refreshToken')
      .populate('collegeId', 'name') // 🔥 College ka naam lene ke liye
      .populate('stateId', 'name') // 🔥 State ka naam lene ke liye
      .populate('cityId', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User session valid',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getSlugByQuery = async (req, res, next) => {
  try {
    let { slug } = req.query;

    // ✅ ADD: validation + normalization
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        message: 'slug query parameter is required',
      });
    }

    slug = slug.trim().toLowerCase();

    const page = await PageModel.findOne({
      slug,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    }).select('slug title content');

    if (!page) {
      return res.status(404).json({
        message: 'Page not found',
      });
    }

    // ✅ ADD: cache for static pages
    res.set('Cache-Control', 'public, max-age=300');

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ ADD: validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    // ✅ ADD: authorization (user can access only own data)
    if (req.user._id.toString() !== id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const userData = await UserModel.findById(id)
      .select('-password -otp -otpExpiresAt')
      .populate('collegeId', 'name') // 🔥 College ka naam lene ke liye
      .populate('stateId', 'name') // 🔥 State ka naam lene ke liye
      .populate('cityId', 'name');

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const editProfileOfUser = async (req, res, next) => {
  try {
    // ✅ WHITELIST allowed fields
    const allowedFields = [
      'name',
      'mobile',
      'address',
      'countryId',
      'stateId',
      'cityId',

      'classId',
      'passingYear',
      'admissionYear',
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // ✅ COLLEGE NAME UPDATE (NO REQUIRED CITY / STATE)
    if (req.body.collegeName) {
      const collegeName = req.body.collegeName.trim();

      // user ka current data nikaalo
      const currentUser = await UserModel.findById(req.user._id).select(
        'cityId stateId'
      );

      const cityId = req.body.cityId || currentUser?.cityId || null;
      const stateId = req.body.stateId || currentUser?.stateId || null;

      let collegeQuery = {
        name: { $regex: new RegExp(`^${collegeName}$`, 'i') },
      };

      if (cityId) {
        collegeQuery.cityId = cityId;
      }

      let college = await College.findOne(collegeQuery);

      // agar college nahi mila → create kar do
      if (!college) {
        college = await College.create({
          name: collegeName,
          cityId,
          stateId,
          isActive: true,
        });
      }

      updateData.collegeId = college._id;
    }

    // ✅ Image upload
    if (req.file) {
      updateData.profileImage = `/uploads/user-profile/${req.file.filename}`;
    }

    // ✅ Empty update protection
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    // ✅ LOCATION VALIDATION (FIXED: no countryId check)
    const { stateId, cityId } = updateData;

    if (stateId && cityId) {
      const validCity = await City.findOne({
        _id: cityId,
        stateId,
      });

      if (!validCity) {
        return res.status(400).json({
          success: false,
          message: 'Invalid state and city combination',
        });
      }
    }

    // ✅ CLASS VALIDATION
    if (updateData.classId) {
      const validClass = await ClassModel.findById(updateData.classId);
      if (!validClass) {
        return res.status(400).json({
          success: false,
          message: 'Invalid class',
        });
      }
    }

    // ✅ UPDATE USER
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        select: '-password -otp -otpExpiresAt',
      }
    ).populate('collegeId', 'name');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// export const getSubjectsByUser = async (req, res) => {
//   try {
//     // 1. Agar aapko kisi specific course ke subjects chahiye (e.g. ?courseId=123)
//     const { courseId } = req.query;

//     let filter = { status: 'active' }; // Sirf active subjects dikhayenge
//     if (courseId) {
//       filter.courseId = courseId;
//     }

//     // 2. Database se subjects nikalna
//     // .select() ka use karke hum sirf wahi data bhejenge jo user ko chahiye
//     // .sort() se 'order' ke hisaab se list dikhegi
//     const subjects = await Subject.find(filter)
//       .select('name description order')
//       .sort({ order: 1 });

//     // 3. Response bhejna
//     res.status(200).json({
//       success: true,
//       count: subjects.length,
//       data: subjects,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Subjects fetch nahi ho paye',
//       error: error.message,
//     });
//   }
// };

// Pearl model import karein (agar count dikhana hai)
// import Pearl from '../../models/admin/Pearl.js';

export const getSubjectsByUser = async (req, res) => {
  try {
    const { courseId } = req.query;

    let filter = { status: 'active' };
    if (courseId) {
      filter.courseId = courseId;
    }

    // 1. Database se data nikalna
    // 'image' field ko add kiya hai kyunki app mein icon dikhana hoga
    const subjects = await Subject.find(filter)
      .select('name description image order')
      .sort({ order: 1 });

    // 2. Base URL set karein taaki Flutter ko poora path mile
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    // 3. Data ko transform karein (Image URL fix karne ke liye)
    const formattedSubjects = subjects.map((subject) => {
      return {
        ...subject._doc,
        image: subject.image ? `${baseUrl}${subject.image}` : null,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedSubjects.length,
      data: formattedSubjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Subjects fetch nahi ho paye',
      error: error.message,
    });
  }
};

export const getAllsubjects = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: 'courseId is required' });
    }

    // REAL DATA: Database mein is course ke total kitne active subjects hain
    const totalSubjects = await Subject.countDocuments({
      courseId,
      status: 'active',
    });

    res.status(200).json({
      success: true,
      data: {
        _id: 'all',
        name: 'All',
        count: totalSubjects, // Yeh real number aayega database se
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const getSubSubjectsBySubject = async (req, res) => {
//   try {
//     const { subjectId } = req.query; // Frontend se subjectId aayegi

//     if (!subjectId) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'subjectId is required' });
//     }

//     // Database se wahi sub-subjects nikalna jo is subjectId se linked hain
//     const subSubjects = await SubSubject.find({
//       subjectId: subjectId,
//       status: 'active',
//     })
//       .select('name order')
//       .sort({ order: 1 });

//     res.status(200).json({
//       success: true,
//       count: subSubjects.length,
//       data: subSubjects,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getSubSubjectsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'subjectId is required',
      });
    }

    // 1️⃣ Sub-subjects fetch
    const subSubjects = await SubSubject.find({
      subjectId: subjectId,
      status: 'active',
    })
      .select('name image order')
      .sort({ order: 1 })
      .lean();

    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    // 2️⃣ Har Sub-Subject ke liye Topic + Video Count
    const formattedData = await Promise.all(
      subSubjects.map(async (item) => {
        // Sub-subject ke saare topics
        const topics = await Topic.find({
          subSubjectId: item._id,
          status: 'active',
        }).select('_id');

        const topicIds = topics.map((t) => t._id);

        // In topics ke total videos
        const totalVideos = await Video.countDocuments({
          topicId: { $in: topicIds },
          status: 'active',
        });
        const videoCount = totalVideos;
        return {
          _id: item._id,
          name: item.name,
          order: item.order,
          image: item.image ? `${baseUrl}${item.image}` : null,
          videoCount, // 👈 NEW FIELD
        };
      })
    );

    res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopicsWithChaptersForUser = async (req, res) => {
  try {
    const { subSubjectId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(subSubjectId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid subSubjectId' });
    }

    // 1. Topics fetch karein
    const topics = await Topic.find({ subSubjectId, status: 'active' })
      .select('name description order')
      .sort({ order: 1 })
      .lean();

    const topicIds = topics.map((t) => t._id);

    // 2. Chapters fetch karein
    const chapters = await Chapter.find({
      topicId: { $in: topicIds },
      status: 'active',
    })
      .select('name topicId order')
      .sort({ order: 1 })
      .lean();

    // 3. User ke saare Bookmarks fetch karein
    const userBookmarks = await Bookmark.find({ userId }).lean();
    const bookmarkMap = {};
    userBookmarks.forEach((b) => {
      const id = b.chapterId || b.topicId || b.mcqId || b.itemId;
      if (id) {
        bookmarkMap[id.toString()] = b.category || 'general';
      }
    });

    // 4. Video Counts fetch karein (Topic-wise)
    // Hum aggregation use kar rahe hain taaki saare topics ka count ek baar mein mil jaye
    const videoCounts = await Video.aggregate([
      {
        $match: {
          topicId: { $in: topicIds },
          status: 'active',
        },
      },
      {
        $group: {
          _id: '$topicId',
          totalVideos: { $sum: 1 },
        },
      },
    ]);

    // Count map banayein fast lookup ke liye
    const countMap = {};
    videoCounts.forEach((vc) => {
      countMap[vc._id.toString()] = vc.totalVideos;
    });

    // 5. Data Map karein aur counts + bookmarks add karein
    const result = topics.map((topic) => {
      const topicIdStr = topic._id.toString();

      const topicChapters = chapters
        .filter((ch) => ch.topicId.toString() === topicIdStr)
        .map((ch) => {
          const chIdStr = ch._id.toString();
          return {
            ...ch,
            isBookMarked: !!bookmarkMap[chIdStr],
            bookMarkedCategory: bookmarkMap[chIdStr] || null,
          };
        });

      return {
        ...topic,
        videoCount: countMap[topicIdStr] || 0, // 👈 Topic wise total video count
        isBookMarked: !!bookmarkMap[topicIdStr],
        bookMarkedCategory: bookmarkMap[topicIdStr] || null,
        chapters: topicChapters,
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const getTopicsWithChaptersForUser = async (req, res) => {
//   try {
//     const { subSubjectId } = req.params;
//     const userId = req.user._id;

//     if (!mongoose.Types.ObjectId.isValid(subSubjectId)) {
//       return res.status(400).json({ success: false, message: 'Invalid subSubjectId' });
//     }

//     // 1. Topics fetch karein
//     const topics = await Topic.find({ subSubjectId, status: 'active' })
//       .select('name description order')
//       .sort({ order: 1 })
//       .lean();

//     const topicIds = topics.map(t => t._id);

//     // 2. Chapters fetch karein
//     const chapters = await Chapter.find({ topicId: { $in: topicIds }, status: 'active' })
//       .select('name topicId order')
//       .sort({ order: 1 })
//       .lean();

//     // 3. User ke saare Bookmarks fetch karein
//     const userBookmarks = await Bookmark.find({ userId }).lean();

//     // Ek Map banayein taaki ID se category turant mil jaye
//     const bookmarkMap = {};
//     userBookmarks.forEach(b => {
//       const id = b.chapterId || b.topicId || b.mcqId || b.itemId;
//       if (id) {
//         bookmarkMap[id.toString()] = b.category || 'general';
//       }
//     });

//     // 4. Data Map karein aur isBookmarked + category add karein
//     const result = topics.map(topic => {
//       const topicIdStr = topic._id.toString();

//       const topicChapters = chapters
//         .filter(ch => ch.topicId.toString() === topicIdStr)
//         .map(ch => {
//           const chIdStr = ch._id.toString();
//           return {
//             ...ch,
//             isBookMarked: !!bookmarkMap[chIdStr],
//             bookMarkedCategory  : bookmarkMap[chIdStr] || null // Agar bookmarked hai to category dikhayega
//           };
//         });

//       return {
//         ...topic,
//         isBookMarked: !!bookmarkMap[topicIdStr],
//         bookMarkedCategory  : bookmarkMap[topicIdStr] || null, // Topic ki category
//         chapters: topicChapters
//       };
//     });

//     res.status(200).json({
//       success: true,
//       count: result.length,
//       data: result,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getAllTopicsForUser = async (req, res) => {
  try {
    const topics = await Topic.find({ status: 'active' })
      .populate({
        path: 'subSubjectId',
        select: 'name subjectId',
        populate: {
          path: 'subjectId',
          select: 'name',
        },
      })
      .select('name description order subSubjectId')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Topics fetch nahi ho paye',
      error: error.message,
    });
  }
};

export const getTopicsByChapterForUser = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapterId',
      });
    }

    const chapter = await Chapter.findById(chapterId).select('topicId');

    if (!chapter || !chapter.topicId) {
      return res.status(404).json({
        success: false,
        message: 'No topic found for this chapter',
      });
    }

    const topic = await Topic.findOne({
      _id: chapter.topicId,
      status: 'active',
    }).select('name description order');

    res.status(200).json({
      success: true,
      data: topic ? [topic] : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleTopicForUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topic id',
      });
    }

    const topic = await Topic.findOne({
      _id: id,
      status: 'active',
    })
      .populate({
        path: 'subSubjectId',
        select: 'name subjectId',
        populate: {
          path: 'subjectId',
          select: 'name',
        },
      })
      .select('name description order subSubjectId');

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// export const getChaptersByTopicForUser = async (req, res) => {
//   try {
//     const { topicId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(topicId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid topicId',
//       });
//     }

//     // 1️⃣ Fetch Chapters
//     const chapters = await Chapter.find({
//       topicId,
//       status: 'active',
//     })
//       .select('_id name order image') // 👈 image add
//       .sort({ order: 1 })
//       .lean();

//     const chapterIds = chapters.map((c) => c._id);

//     // 2️⃣ MCQ Count per Chapter
//     const mcqCounts = await MCQ.aggregate([
//       {
//         $match: {
//           chapterId: { $in: chapterIds },
//           status: 'active',
//         },
//       },
//       {
//         $group: {
//           _id: '$chapterId',
//           totalMcq: { $sum: 1 },
//         },
//       },
//     ]);

//     // 3️⃣ Rating per Chapter (from MCQs avg rating OR Video ratings if needed)
//     const ratings = await Rating.aggregate([
//       {
//         $lookup: {
//           from: 'videos',
//           localField: 'videoId',
//           foreignField: '_id',
//           as: 'video',
//         },
//       },
//       { $unwind: '$video' },
//       {
//         $match: {
//           'video.chapterId': { $in: chapterIds },
//         },
//       },
//       {
//         $group: {
//           _id: '$video.chapterId',
//           avgRating: { $avg: '$rating' },
//         },
//       },
//     ]);

//     const baseUrl = `${req.protocol}://${req.get('host')}`;

//     // 4️⃣ Merge Everything
//     const formattedChapters = chapters.map((chapter) => {
//       const mcqData = mcqCounts.find(
//         (m) => m._id.toString() === chapter._id.toString()
//       );

//       const ratingData = ratings.find(
//         (r) => r._id.toString() === chapter._id.toString()
//       );

//       return {
//         chapterId: chapter._id,
//         chapterName: chapter.name,
//         chapterImage: chapter.image ? `${baseUrl}${chapter.image}` : null,
//         totalMcq: mcqData ? mcqData.totalMcq : 0,
//         rating: ratingData ? Number(ratingData.avgRating.toFixed(1)) : 0,
//         order: chapter.order,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       count: formattedChapters.length,
//       data: formattedChapters,
//     });
//   } catch (error) {
//     console.error('Get Chapters By Topic Error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export const getChaptersByTopicForUser = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topicId',
      });
    }

    // 1️⃣ Chapters
    const chapters = await Chapter.find({
      topicId,
      status: 'active',
    })
      .select('_id name order image')
      .sort({ order: 1 })
      .lean();

    const chapterIds = chapters.map((c) => c._id);

    // 2️⃣ MCQ count
    const mcqCounts = await MCQ.aggregate([
      {
        $match: {
          chapterId: { $in: chapterIds },
          status: 'active',
        },
      },
      {
        $group: {
          _id: '$chapterId',
          totalMcq: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ User Attempts (IMPORTANT PART)
    const attempts = await TestAttempt.find({
      userId,
      chapterId: { $in: chapterIds },
    })
      .select('chapterId answers submittedAt')
      .lean();

    // 4️⃣ Rating
    const ratings = await Rating.aggregate([
      {
        $lookup: {
          from: 'videos',
          localField: 'videoId',
          foreignField: '_id',
          as: 'video',
        },
      },
      { $unwind: '$video' },
      {
        $match: {
          'video.chapterId': { $in: chapterIds },
        },
      },
      {
        $group: {
          _id: '$video.chapterId',
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // 5️⃣ Final merge
    const formattedChapters = chapters.map((chapter) => {
      const mcqData = mcqCounts.find(
        (m) => m._id.toString() === chapter._id.toString()
      );

      const ratingData = ratings.find(
        (r) => r._id.toString() === chapter._id.toString()
      );

      const attempt = attempts.find(
        (a) => a.chapterId?.toString() === chapter._id.toString()
      );

      let status = 'NOT_STARTED';
      let attemptedMcq = 0;

      if (attempt) {
        attemptedMcq = attempt.answers?.length || 0;
        status = attempt.submittedAt ? 'COMPLETED' : 'IN_PROGRESS';
      }
      console.log('Image URL Build:', `${baseUrl}${chapter.image}`);
      return {
        chapterId: chapter._id,
        chapterName: chapter.name,
        chapterImage: chapter.image ? `${baseUrl}${chapter.image}` : null,
        totalMcq: mcqData ? mcqData.totalMcq : 0,
        attemptedMcq,
        status,
        rating: ratingData ? Number(ratingData.avgRating.toFixed(1)) : 0,
        order: chapter.order,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedChapters.length,
      data: formattedChapters,
    });
  } catch (error) {
    console.error('Get Chapters By Topic Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//working one
// export const getMcqsByChapter = async (req, res) => {
//   try {
//     const { chapterId } = req.query;

//     if (!chapterId) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'chapterId is required' });
//     }

//     const mcqs = await MCQ.find({ chapterId, status: 'active' })
//       .select('-createdBy -updatedBy') // Admin details ki zaroorat nahi hai
//       .sort({ createdAt: 1 });

//     res.status(200).json({
//       success: true,
//       count: mcqs.length,
//       data: mcqs,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Ye function aap ek helper file mein ya usi controller mein upar rakh sakte hain

// export const getMcqsByChapter = async (req, res) => {
//   try {
//     const { chapterId } = req.query;
//     const userId = req.user._id;

//     if (!chapterId) {
//       return res.status(400).json({ success: false, message: 'chapterId is required' });
//     }

//     // 1. MCQs fetch karein
//     const mcqs = await MCQ.find({ chapterId, status: 'active' })
//       .select('-createdBy -updatedBy')
//       .sort({ createdAt: 1 });

//     // 2. User Progress Update (Single Atomic Operation)
//     const userBeforeUpdate = await UserModel.findById(userId);

//     // Check karein ki kya ye chapter pehle se list mein hai?
//     const isNewChapter = !userBeforeUpdate.completedChapters.includes(chapterId);

//     let currentModulesCount = userBeforeUpdate.completedModulesCount || 0;

//     if (isNewChapter) {
//       // Agar naya chapter hai, toh array mein add karo aur count badhao
//       const updatedUser = await UserModel.findByIdAndUpdate(
//         userId,
//         {
//           $addToSet: { completedChapters: chapterId },
//           $inc: { completedModulesCount: 1 }
//         },
//         { new: true }
//       );
//       currentModulesCount = updatedUser.completedModulesCount;
//     }

//     // 3. Final Response
//     res.status(200).json({
//       success: true,
//       mcqCount: mcqs.length,
//       completedModulesCount: currentModulesCount,
//       data: mcqs,
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// B. Test Submit karke Result Calculate karna
export const getMcqsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.query;
    const userId = req.user._id;

    if (!chapterId) {
      return res
        .status(400)
        .json({ success: false, message: 'chapterId is required' });
    }

    // 1. MCQs fetch karein
    const mcqs = await MCQ.find({ chapterId, status: 'active' })
      .select('-createdBy -updatedBy')
      .sort({ createdAt: 1 });

    // 2. Helper function se progress update karein
    const currentCount = await updateUserChapterProgress(userId, chapterId);

    // 3. Response
    res.status(200).json({
      success: true,
      mcqCount: mcqs.length,
      completedModulesCount: currentCount,
      data: mcqs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { chapterId, answers } = req.body;
    // answers format: [{ mcqId: "id", selectedIndex: 0 }, ...]

    if (!chapterId || !answers) {
      return res.status(400).json({ success: false, message: 'Data missing' });
    }

    // Database se us chapter ke saare sahi answers nikalna
    const dbMcqs = await MCQ.find({ chapterId, status: 'active' });

    let correct = 0;
    let incorrect = 0;
    let notAttempted = 0;
    const total = dbMcqs.length;

    dbMcqs.forEach((mcq) => {
      // User ne is question ka kya answer diya?
      const userAns = answers.find((a) => a.mcqId === mcq._id.toString());

      if (
        !userAns ||
        userAns.selectedIndex === null ||
        userAns.selectedIndex === undefined
      ) {
        notAttempted++;
      } else if (userAns.selectedIndex === mcq.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    res.status(200).json({
      success: true,
      result: {
        totalQuestions: total,
        solved: answers.length,
        correct: correct,
        incorrect: incorrect,
        notAttempted: notAttempted,
        scorePercentage: ((correct / total) * 100).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 1. Saare Active Plans Dekhna
// export const getActivePlans = async (req, res, next) => {
//   try {
//     const plans = await SubscriptionPlan.find({ isActive: true });
//     res.status(200).json({ success: true, data: plans });
//   } catch (error) {
//     next(error);
//   }
// };
// 1. Get All Active Plans (For Plan Selection Screen)
export const getActivePlans = async (req, res, next) => {
  try {
    // Pricing ke hisab se sort kar diya taaki sasta plan pehle dikhe
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({
      'pricing.0.price': 1,
    });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get User's Current Plan (For Profile or Checking Access)
export const getMySubscription = async (req, res) => {
  try {
    const user_id = req.user._id; // Auth middleware se aayega

    const user = await UserModel.findById(user_id)
      .select('subscription subscriptionStatus')
      .populate('subscription.plan_id', 'name features');

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Check if subscription exists and is NOT expired
    const today = new Date();
    const hasActivePlan =
      user.subscription &&
      user.subscription.isActive &&
      user.subscription.endDate > today;

    if (!hasActivePlan) {
      return res.status(200).json({
        status: true,
        isSubscribed: false,
        message: 'No active subscription found or plan expired',
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      isSubscribed: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// 2. Buy Subscription (Final Step after Payment)
export const buySubscription = async (req, res, next) => {
  try {
    const { planId, months, paymentId, orderId } = req.body;
    const userId = req.user._id;

    // Plan check karein
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Price confirm karein
    const selectedPricing = plan.pricing.find(
      (p) => p.months === Number(months)
    );
    if (!selectedPricing)
      return res.status(400).json({ message: 'Invalid duration' });

    // Expiry Date calculate karein
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(months));

    // Status decide karein plan ke name ke hisaab se
    let status = 'starter';
    if (plan.name.toLowerCase().includes('pro')) status = 'professional';
    if (plan.name.toLowerCase().includes('premium')) status = 'premium_plus';

    // USER UPDATE (Aapka model update ho raha hai)
    await UserModel.findByIdAndUpdate(userId, {
      subscription: {
        plan_id: planId,
        startDate,
        endDate,
        isActive: true,
        selectedMonths: months,
      },
      subscriptionStatus: status,
    });

    // Transaction save karein
    await TransactionModel.create({
      userId,
      planId,
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      amount: selectedPricing.price,
      months: Number(months),
    });

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully!',
      expiryDate: endDate,
    });
  } catch (error) {
    next(error);
  }
};
// export const getMySubscription = async (req, res) => {
//   try {
//     const user_id = req.user._id;
//     const user = await UserModel.findById(user_id)
//       .select('subscription subscriptionStatus')
//       .populate('subscription.plan_id', 'name features');

//     if (!user.subscription || !user.subscription.isActive) {
//       return res.status(200).json({
//         status: true,
//         message: 'No active subscription found',
//         data: null,
//       });
//     }

//     res.status(200).json({ status: true, data: user });
//   } catch (error) {
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

export const postRating = async (req, res) => {
  try {
    const { rating, review, targetType, targetId } = req.body;
    const userId = req.user._id;

    // 1️⃣ Required fields check
    if (rating === undefined || !targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: 'rating, targetType and targetId are required',
      });
    }

    // 2️⃣ Rating validation
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    // 3️⃣ targetType validation (MATCH SCHEMA)
    const allowedTypes = [
      'course',
      'subject',
      'sub-subject',
      'topic',
      'chapter',
      'video',
      'test',
    ];

    if (!allowedTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid targetType',
      });
    }

    // 4️⃣ ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid targetId',
      });
    }

    // 5️⃣ Upsert rating
    const savedRating = await Rating.findOneAndUpdate(
      { userId, targetType, targetId },
      {
        rating: numericRating,
        review,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Rating saved successfully',
      data: savedRating,
    });
  } catch (error) {
    console.error('postRating error:', error);

    // 6️⃣ Duplicate key safety (edge case)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this item',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
    });
  }
};

// export const postRating = async (req, res) => {
//   try {
//     const { rating, review, videoId } = req.body; // videoId add kiya
//     const userId = req.user._id;

//     if (!rating || !videoId) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Rating and VideoId are required' });
//     }

//     // Update if already exists, else create new (Optional logic)
//     const newRating = await Rating.findOneAndUpdate(
//       { userId, videoId },
//       { rating, review },
//       { upsert: true, new: true }
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Thank you for your rating!',
//       data: newRating,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getAllSubSubjectsForUser = async (req, res) => {
  try {
    const { courseId } = req.query; // Course ke base par filter zaroori hai

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: 'courseId is required' });
    }

    // Pure course ke saare active sub-subjects fetch karna
    const subSubjects = await SubSubject.find({
      courseId: courseId,
      status: 'active',
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: subSubjects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc    Get only Course Names and IDs for selection
 * @route   GET /api/user/courses/list
 * @access  Public
 */
export const getCourseListSimple = async (req, res, next) => {
  try {
    // Sirf active aur published courses ka 'name' uthayenge
    const courses = await Course.find(
      { status: 'active', isPublished: true },
      'name'
    ).sort({ name: 1 }); // Alphabetical order mein sort kiya hai

    res.status(200).json({
      success: true,
      message: 'Course list fetched successfully',
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// export const getTopicVideosForUser = async (req, res) => {
//   try {
//     const { topicId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(topicId)) {
//       return res.status(400).json({ success: false, message: 'Invalid topicId' });
//     }

//     // 1. Topic ki Basic Details nikaalo (Sirf Name aur Description)
//     const topic = await Topic.findById(topicId).select('name description').lean();

//     if (!topic) {
//       return res.status(404).json({ success: false, message: 'Topic not found' });
//     }

//     // 2. Is Topic se related SAARE ACTIVE VIDEOS nikaalo
//     // Humne yahan chapterId ko bypass kar diya hai, direct topicId se filter kiya hai
//     const videos = await Video.find({
//       topicId: topicId,
//       status: 'active'
//     })
//     .select('title thumbnailUrl videoUrl notesUrl order') // Jo fields aapne maangi hain
//     .sort({ order: 1 })
//     .lean();

//     // 3. Response Structure (Simple List for Flutter)
//     res.status(200).json({
//       success: true,
//       topicName: topic.name,
//       totalVideos: videos.length,
//       data: videos.map(video => ({
//         ...video,
//         watchStatus: "unattended" // Default status (Completed/Paused baad mein logic se aayega)
//       }))
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getTopicVideosForUser = async (req, res) => {
//   try {
//     const { topicId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(topicId)) {
//       return res.status(400).json({ success: false, message: 'Invalid topicId format' });
//     }

//     // 1. Topic ka naam nikaalein
//     const topic = await Topic.findById(topicId).select('name').lean();
//     if (!topic) {
//       return res.status(404).json({ success: false, message: 'Topic not found' });
//     }

//     // 2. Is Topic ke andar jitne ACTIVE Chapters hain wo nikaalein
//     const chapters = await Chapter.find({ topicId, status: 'active' })
//       .select('name order')
//       .sort({ order: 1 })
//       .lean();

//     // 3. Is Topic ke saare ACTIVE Videos nikaalein
//     const allVideos = await Video.find({ topicId, status: 'active' })
//       .select('title thumbnailUrl videoUrl chapterId order')
//       .sort({ order: 1 })
//       .lean();

//     // 4. Grouping Logic: Har Chapter ke andar uske Videos daalna
//     const groupedData = chapters.map(chapter => {
//       // Is chapter se match hone waale videos filter karein
//       const chapterVideos = allVideos.filter(
//         v => v.chapterId.toString() === chapter._id.toString()
//       );

//       return {
//         chapterId: chapter._id,
//         chapterName: chapter.name,
//         videos: chapterVideos // Sirf is chapter ke videos yahan aayenge
//       };
//     });

//     res.status(200).json({
//       success: true,
//       topicName: topic.name,
//       data: groupedData
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// export const getTopicVideosForUser = async (req, res) => {
//   try {
//     const { topicId } = req.params;
//     const { filterType } = req.query; // Query params: 'all', 'paused', 'completed', 'unattended'
//     const userId = req.user._id;

//     const topic = await Topic.findById(topicId).select('name').lean();
//     const chapters = await Chapter.find({ topicId, status: 'active' }).sort({ order: 1 }).lean();

//     // Aggregation: Videos + Student ki Progress ko merge karna
//     let videos = await Video.aggregate([
//       { $match: { topicId: new mongoose.Types.ObjectId(topicId), status: 'active' } },
//       {
//         $lookup: {
//           from: 'videoprogresses', // Make sure collection name is correct (lowercase plural)
//           let: { vId: '$_id' },
//           pipeline: [
//             { $match: { $expr: { $and: [ { $eq: ['$videoId', '$$vId'] }, { $eq: ['$userId', userId] } ] } } }
//           ],
//           as: 'progressInfo'
//         }
//       },
//       {
//         $lookup: {
//           from: 'ratings',
//           localField: '_id',
//           foreignField: 'videoId',
//           as: 'allRatings'
//         }
//       },
//       {
//         $addFields: {
//           statusTag: { $ifNull: [{ $arrayElemAt: ['$progressInfo.status', 0] }, 'unattended'] },
//           watchPercentage: { $ifNull: [{ $arrayElemAt: ['$progressInfo.percentage', 0] }, 0] }
//         }
//       },
//       { $project: { progressInfo: 0 } }
//     ]);

//     // Filtering Logic
//     if (filterType === 'completed') {
//       videos = videos.filter(v => v.statusTag === 'completed');
//     } else if (filterType === 'paused') {
//       videos = videos.filter(v => v.statusTag === 'watching');
//     } else if (filterType === 'unattended') {
//       videos = videos.filter(v => v.statusTag === 'unattended');
//     }

//     // Grouping into Chapters
//     const groupedData = chapters.map(chapter => {
//       const chapterVideos = videos.filter(v => v.chapterId.toString() === chapter._id.toString());
//       return {
//         chapterId: chapter._id,
//         chapterName: chapter.name,
//         videos: chapterVideos
//       };
//     });

//     res.status(200).json({
//       success: true,
//       topicName: topic?.name,
//       data: groupedData
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
export const getTopicVideosForUser = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { filterType } = req.query;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId).select('name').lean();
    const chapters = await Chapter.find({ topicId, status: 'active' })
      .sort({ order: 1 })
      .lean();

    // Aggregation: Videos + Progress + Ratings
    let videos = await Video.aggregate([
      // 1. Topic ke videos filter karein
      {
        $match: {
          topicId: new mongoose.Types.ObjectId(topicId),
          status: 'active',
        },
      },

      // 2. Progress Lookup
      {
        $lookup: {
          from: 'videoprogresses',
          let: { vId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$videoId', '$$vId'] },
                    { $eq: ['$userId', userId] },
                  ],
                },
              },
            },
          ],
          as: 'progressInfo',
        },
      },

      // 3. Ratings Lookup (Iske bina totalReviews error dega)
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'videoId',
          as: 'allRatings',
        },
      },

      // 4. Fields Calculation (Null values ko 0 mein badalna)
      {
        $addFields: {
          statusTag: {
            $ifNull: [
              { $arrayElemAt: ['$progressInfo.status', 0] },
              'unattended',
            ],
          },
          watchPercentage: {
            $ifNull: [{ $arrayElemAt: ['$progressInfo.percentage', 0] }, 0],
          },
          lastWatchTime: {
            $ifNull: [{ $arrayElemAt: ['$progressInfo.watchTime', 0] }, 0],
          },
          avgRating: { $ifNull: [{ $avg: '$allRatings.rating' }, 0] }, // Null to 0
          totalReviews: { $size: { $ifNull: ['$allRatings', []] } }, // Missing array to 0
        },
      },
      { $project: { progressInfo: 0, allRatings: 0 } },
    ]);

    // DEBUG: Terminal mein check karein ki kitne videos mile
    console.log('Total Videos Found before filter:', videos.length);

    // 5. Filtering Logic
    if (filterType && filterType !== 'all') {
      const typeMap = {
        completed: 'completed',
        paused: 'watching',
        unattended: 'unattended',
      };
      const targetStatus = typeMap[filterType];
      if (targetStatus) {
        videos = videos.filter((v) => v.statusTag === targetStatus);
      }
    }

    // 6. Grouping into Chapters (Match check)
    // const groupedData = chapters.map(chapter => {
    //   const chapterVideos = videos.filter(v =>
    //     v.chapterId && v.chapterId.toString() === chapter._id.toString()
    //   );
    const groupedData = chapters.map((chapter) => {
      // Debug: Check karein IDs match ho rahi hain ya nahi
      const chapterVideos = videos.filter((v) => {
        if (!v.chapterId) return false;
        return v.chapterId.toString() === chapter._id.toString();
      });

      return {
        chapterId: chapter._id,
        chapterName: chapter.name,
        videos: chapterVideos,
      };
    });

    // return {
    //   chapterId: chapter._id,
    //   chapterName: chapter.name,
    //   videos: chapterVideos
    // };
    // }).filter(group => group.videos.length > 0); // Sirf wahi chapters dikhao jinme videos hain
    const finalData = groupedData.filter((group) => group.videos.length > 0);
    res.status(200).json({
      success: true,
      topicName: topic?.name,
      // totalVideosCount: videos.length,
      data: finalData,
    });
  } catch (error) {
    console.error('Aggregation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVideoProgress = async (req, res) => {
  try {
    const { videoId, topicId, watchTime, totalDuration } = req.body;
    const userId = req.user._id; // Auth middleware se mil raha hai

    // Percentage calculate karein
    const percentage = (watchTime / totalDuration) * 100;

    let status = 'watching';
    if (percentage >= 90) status = 'completed'; // 90% dekha matlab complete

    const progress = await VideoProgress.findOneAndUpdate(
      { userId, videoId },
      {
        topicId,
        watchTime,
        totalDuration,
        percentage: Math.round(percentage),
        status,
      },
      { upsert: true, new: true } // Agar record nahi hai toh naya bana dega
    );

    // 🔥 Helper Call: Jab video complete ho tabhi update karein
    if (status === 'completed') {
      const videoData = await Video.findById(videoId).select('chapterId');
      if (videoData?.chapterId) {
        await updateUserChapterProgress(userId, videoData.chapterId);
      }
    }

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate Custom Test (Difficulty + Tag + Subject + Mode)
 * @route   POST /api/users/generate-custom-test
 */

// export const getCustomPracticeMCQs = async (req, res, next) => {
//   try {
//     const { subjectId, tagId, difficulty, mode } = req.body;

//     if (!subjectId) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Subject ID is required' });
//     }

//     const filter = {
//       status: 'active',
//       subjectId: new mongoose.Types.ObjectId(subjectId),
//     };

//     if (tagId) filter.tagId = new mongoose.Types.ObjectId(tagId);
//     if (difficulty) filter.difficulty = difficulty;
//     if (mode) filter.mode = mode;

//     console.log("Final Filter:", filter);

//     const mcqs = await MCQ.aggregate([
//       { $match: filter },
//       { $sample: { size: 20 } },

//       {
//         $lookup: {
//           from: 'tags',
//           localField: 'tagId',
//           foreignField: '_id',
//           as: 'tagDetails',
//         },
//       },
//       {
//         $project: {
//           question: 1,
//           options: 1,
//           correctAnswer: 1,
//           explanation: 1,
//           difficulty: 1,
//           marks: 1,
//           negativeMarks: 1,
//           mode: 1,
//           // Tag details ko readable format mein bhejna
//           tag: { $arrayElemAt: ['$tagDetails', 0] },
//         },
//       },
//     ]);
//     const countCheck = await MCQ.countDocuments({
//     subjectId: filter.subjectId,
//     tagId: filter.tagId
// });
// console.log("Count for Subject + Tag:", countCheck);

//     res.status(200).json({
//       success: true,
//       count: mcqs.length,
//       mode: mode || 'regular',
//       isTimerRequired: mode === 'exam',
//       timerMinutes: 20,
//       data: mcqs,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getCustomPracticeMCQs = async (req, res, next) => {
  try {
    const { subjectId, tagId, difficulty, mode } = req.body;

    if (!subjectId) {
      return res
        .status(400)
        .json({ success: false, message: 'Subject ID is required' });
    }

    // 1. Base Filter (Jo database mein match karega)
    const filter = {
      status: 'active',
      subjectId: new mongoose.Types.ObjectId(subjectId),
    };

    if (tagId) filter.tagId = new mongoose.Types.ObjectId(tagId);

    // Difficulty match (Case-insensitive)
    if (difficulty) {
      filter.difficulty = { $regex: new RegExp(`^${difficulty}$`, 'i') };
    }

    /** * NOTE: Agar aapke MCQ Model mein 'mode' field nahi hai,
     * toh filter.mode ko match nahi karenge, warna result 0 aayega.
     * Hum sirf request se mode lekar frontend ko response bhejenge.
     */

    const mcqs = await MCQ.aggregate([
      { $match: filter },
      { $sample: { size: 20 } },
      {
        $lookup: {
          from: 'tags',
          localField: 'tagId',
          foreignField: '_id',
          as: 'tagDetails',
        },
      },
      {
        $project: {
          question: 1,
          options: 1,
          correctAnswer: 1,
          explanation: 1,
          difficulty: 1,
          marks: 1,
          negativeMarks: 1,
          // Jo mode user ne request mein bheja hai, wahi har MCQ mein dikhega
          mode: { $literal: mode || 'regular' },
          tag: { $arrayElemAt: ['$tagDetails', 0] },
        },
      },
    ]);

    // 2. Timer Logic based on requested 'mode'
    // Sirf 'exam' mode hone par hi timer activate hoga
    const isExamMode = mode?.toLowerCase() === 'exam';

    res.status(200).json({
      success: true,
      count: mcqs.length,
      requestedMode: mode || 'regular',
      isTimerRequired: isExamMode,
      timerMinutes: isExamMode ? 20 : 0, // Exam mode = 20 mins, Regular = 0
      data: mcqs,
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyMCQ = async (req, res, next) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Format: 2024-05-20

    // Date ko seed number mein badalna taaki poore din ek hi question dikhe
    const seed = dateString
      .split('-')
      .reduce((acc, val) => acc + parseInt(val), 0);

    const count = await MCQ.countDocuments({ status: 'active' });

    if (count === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No active MCQs found' });
    }

    const dailyIndex = seed % count;

    const dailyQuestion = await MCQ.findOne({ status: 'active' })
      .skip(dailyIndex)
      .populate('courseId subjectId subSubjectId chapterId tagId', 'name');

    res.status(200).json({
      success: true,
      message: 'Daily MCQ fetched successfully',
      date: dateString,
      data: dailyQuestion,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllTagsForUsers = async (req, res, next) => {
  try {
    // Users ke liye hum aksar A-Z sort karte hain taaki list readable ho
    const tags = await Tag.find().select('name _id').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};

// export const getCustomPracticeMCQs = async (req, res, next) => {
//   try {
//     const {
//       subjectId,    // Subject select karna compulsory hai
//       tagId,        // Tag (e.g., Previous Year, Important)
//       difficulty,   // Easy, Medium, Hard
//       mode          // regular or exam
//     } = req.body;

//     // 1. Validation: Subject zaroori hai
//     if (!subjectId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please select a Subject to start the test.'
//       });
//     }

//     // 2. Filter Object
//     const filter = {
//         status: 'active',
//         subjectId: new mongoose.Types.ObjectId(subjectId)
//     };

//     // Optional Filters (Agar user select kare toh)
//     if (tagId) filter.tagId = new mongoose.Types.ObjectId(tagId);
//     if (difficulty) filter.difficulty = difficulty;
//     if (mode) filter.mode = mode;

//     // 3. Fetch 20 Random Questions
//     const mcqs = await MCQ.aggregate([
//       { $match: filter },
//       { $sample: { size: 20 } },
//       {
//         $project: {
//           question: 1,
//           options: 1,
//           correctAnswer: 1,
//           explanation: 1,
//           difficulty: 1,
//           marks: 1,
//           negativeMarks: 1,
//           mode: 1
//         }
//       }
//     ]);

//     // 4. Response with Mode Info for Flutter Timer
//     res.status(200).json({
//       success: true,
//       count: mcqs.length,
//       mode: mode || 'regular',
//       // Flutter dev is field ko dekh kar timer on karega
//       isTimerRequired: mode === 'exam' ? true : false,
//       timerMinutes: mode === 'exam' ? 20 : null, // 20 questions ke liye 20 min default
//       data: mcqs
//     });

//   } catch (error) {
//     next(error);
//   }
// };
export const getChapterFullDetails = async (req, res, next) => {
  try {
    const { chapterId } = req.params;

    // 1. Chapter ki details find karein
    // 2. Videos ko populate karein (Jo is chapterId se match karti hon)
    const chapterDetails = await Chapter.findById(chapterId)
      .populate('courseId', 'name') // Optional: Course ka naam chahiye toh
      .populate('topicId', 'name');

    if (!chapterDetails) {
      return res
        .status(404)
        .json({ success: false, message: 'Chapter not found' });
    }

    // 3. Is Chapter se judi saari videos fetch karein
    const videos = await Video.find({ chapterId: chapterId }).sort({
      order: 1,
    });

    // 4. Sab kuch combine karke response bhejein
    res.status(200).json({
      success: true,
      data: {
        ...chapterDetails._doc, // Chapter info (name, desc, image, mcqs)
        content: {
          videos: videos, // Saari videos with notesUrl and thumbnailUrl
          totalVideos: videos.length,
          // Agar notes alag model mein hain toh yahan populate kar sakte hain
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * common validation helper
 */
const validateBookmark = ({ type, mcqId, chapterId, subSubjectId }) => {
  if (!type) return 'type is required';

  if (type === 'mcq' && !mcqId) return 'mcqId is required';
  if (type === 'chapter' && !chapterId) return 'chapterId is required';
  if (type === 'sub-subject' && !subSubjectId)
    return 'subSubjectId is required';

  return null;
};

/**
 * @route   POST /api/bookmarks
 */
// export const addBookmark = async (req, res) => {
//   try {
//     const error = validateBookmark(req.body);
//     if (error) {
//       return res.status(400).json({ success: false, message: error });
//     }

//     const bookmark = await Bookmark.create({
//       userId: req.user._id,
//       type: req.body.type,
//       mcqId: req.body.type === 'mcq' ? req.body.mcqId : null,
//       chapterId: req.body.type === 'chapter' ? req.body.chapterId : null,
//       subSubjectId:
//         req.body.type === 'sub-subject' ? req.body.subSubjectId : null,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Bookmark added',
//       bookmark,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res
//         .status(409)
//         .json({ success: false, message: 'Already bookmarked' });
//     }

//     res.status(500).json({ success: false, message: error.message });
//   }
// };
export const addBookmark = async (req, res) => {
  try {
    const { type, mcqId, chapterId, subSubjectId, topicId, category } =
      req.body;

    // 1. Basic Validation
    if (!type || !category) {
      return res.status(400).json({
        success: false,
        message: 'type and category are required',
      });
    }

    // 2. Data Prepare karein
    const bookmarkData = {
      userId: req.user._id,
      type,
      category, // Ye bhejra zaruri hai (important, veryimportant, etc.)
      mcqId: type === 'mcq' ? mcqId : null,
      chapterId: type === 'chapter' ? chapterId : null,
      topicId: type === 'topic' ? topicId : null,
      subSubjectId: type === 'sub-subject' ? subSubjectId : null,
    };

    // 3. Create Bookmark
    const bookmark = await Bookmark.create(bookmarkData);

    res.status(201).json({
      success: true,
      message: `Bookmark added to ${category}`,
      bookmark,
    });
  } catch (error) {
    // Duplicate Key Error (Unique Index ki wajah se)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Already bookmarked in this category',
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @route   DELETE /api/bookmarks
 */
export const removeBookmark = async (req, res) => {
  try {
    const error = validateBookmark(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    await Bookmark.findOneAndDelete({
      userId: req.user._id,
      type: req.body.type,
      mcqId: req.body.type === 'mcq' ? req.body.mcqId : null,
      chapterId: req.body.type === 'chapter' ? req.body.chapterId : null,
      subSubjectId:
        req.body.type === 'sub-subject' ? req.body.subSubjectId : null,
    });

    res.json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/bookmarks
 */
export const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate('mcqId')
      .populate('chapterId')
      .populate('subSubjectId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookmarkSummary = async (req, res) => {
  try {
    // const { userId } = req.query; // Ab Query se userId lenge
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'userId is required' });
    }

    const counts = await Bookmark.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const result = { all: 0, important: 0, veryimportant: 0, mostimportant: 0 };
    counts.forEach((item) => {
      if (result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
      result.all += item.count;
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2. Get Bookmarks List (Folder wise ya "All")
export const getBookmarksList = async (req, res) => {
  try {
    // const { userId, category } = req.query; // Query se userId aur category
    const { type, itemId, category } = req.body;
    const userId = req.user._id; // ✅ Wapas token se ID lene lage

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'userId is required' });
    }

    let filter = { userId };
    if (category && category !== 'all') {
      filter.category = category;
    }

    const list = await Bookmark.find(filter)
      .populate('mcqId')
      .populate('topicId')
      .populate('chapterId')
      .populate('subSubjectId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3. Toggle Bookmark (Add/Remove Logic)
// export const toggleBookmark = async (req, res) => {
//   try {
//     const { userId, type, itemId, category } = req.body;

//     if (!userId || !type || !category) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: 'userId, type and category are required',
//         });
//     }

//     let query = { userId, type, category };
//     if (type === 'mcq') query.mcqId = itemId;
//     else if (type === 'topic') query.topicId = itemId;
//     else if (type === 'chapter') query.chapterId = itemId;
//     else if (type === 'sub-subject') query.subSubjectId = itemId;

//     const existing = await Bookmark.findOne(query);

//     if (existing) {
//       await Bookmark.findByIdAndDelete(existing._id);
//       return res
//         .status(200)
//         .json({ success: true, message: `Removed from ${category}` });
//     } else {
//       await Bookmark.create(query);
//       return res
//         .status(201)
//         .json({ success: true, message: `Added to ${category}` });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const toggleBookmark = async (req, res) => {
  try {
    const { type, itemId, category } = req.body;
    const userId = req.user._id; // Auth middleware se milega

    if (!itemId || !type) {
      return res
        .status(400)
        .json({ success: false, message: 'itemId and type are required' });
    }

    // Query object taiyaar karein
    let query = { userId, type };

    // Item type ke basis par query set karein
    if (type === 'mcq') query.mcqId = itemId;
    else if (type === 'pearl') query.pearlId = itemId;
    else if (type === 'chapter') query.chapterId = itemId;
    else if (type === 'sub-subject') query.subSubjectId = itemId;

    // Check karein ki kya pehle se bookmark maujood hai
    const existingBookmark = await Bookmark.findOne(query);

    if (existingBookmark) {
      // AGAR HAI TO REMOVE KARO (Toggle OFF)
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return res.status(200).json({
        success: true,
        isBookmarked: false,
        message: 'Removed from bookmarks',
      });
    } else {
      // AGAR NAHI HAI TO ADD KARO (Toggle ON)
      // Naya data object banayein aur category add karein
      const newBookmarkData = { ...query, category: category || 'general' };
      await Bookmark.create(newBookmarkData);

      return res.status(201).json({
        success: true,
        isBookmarked: true,
        message: 'Added to bookmarks',
      });
    }
  } catch (error) {
    console.error('Toggle Bookmark Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // User model se tracking fields nikaalein
    const user = await UserModel.findById(userId).select(
      'completedModulesCount completedChapters'
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        // Ye wahi count hai jo MCQ aur Video dono se update ho raha hai
        totalCompletedModules: user.completedModulesCount || 0,

        // Agar aapko list bhi chahiye ki kaunse chapters complete hue
        completedChapterIds: user.completedChapters,

        // Aap yahan aur bhi stats add kar sakte hain (jaise certificates, marks etc.)
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
