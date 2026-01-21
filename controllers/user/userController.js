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
import Rating from "../../models/admin/Rating.js"

// import Course from '../../models/admin/Course/course.model.js';

export const loginByGoogle = async (req, res, next) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res
        .status(400)
        .json({ message: 'Google access token is required' });
    }

    // ✅ REAL TOKEN VERIFY
    // ✅ SECURE TOKEN VERIFY (NO GOOGLE HTTP CALL)
    let payload;

    try {
      const ticket = await client.verifyIdToken({
        idToken: access_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    if (!payload?.email || !payload?.sub) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const name = payload.name || 'Google User';

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        name,
        email,
        googleId,
        signUpBy: 'google',
        isEmailVerified: true,
        role: 'user',
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (user.signUpBy === 'email' && !user.isEmailVerified) {
        user.isEmailVerified = true;
        user.signUpBy = 'google';
      }
      await user.save();
    }

    if (user.status !== 'active') {
      return res
        .status(403)
        .json({ message: 'Account is blocked or inactive' });
    }

    const { accessToken, refreshToken } = generateToken(user._id); // updated below

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpiresAt;

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// export const register = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       name,
//       email,
//       mobile,
//       address,
//       countryId,
//       stateId,
//       cityId,
//       collegeId,
//       classId,
//       admissionYear,
//       password,
//     } = req.body;

//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: 'Name, email and password are required' });
//     }
//     const activeState = await State.findOne({ _id: stateId, countryId, active: true });
//     if (!activeState) {
//       return res.status(400).json({ message: 'This state is currently not active for registration' });
//     }

//     if (!(await Country.findById(countryId)))
//       throw new Error('Invalid country');
//     if (!(await State.findOne({ _id: stateId, countryId })))
//       throw new Error('Invalid state');
//     if (!(await City.findOne({ _id: cityId, stateId, countryId })))
//       throw new Error('Invalid city');

//     if (
//       !(await College.findOne({ _id: collegeId, cityId, stateId, countryId }))
//     )
//       throw new Error('Invalid college');

//     if (!(await ClassModel.findById(classId))) throw new Error('Invalid class');

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: 'Password must be at least 6 characters' });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     if (await UserModel.findOne({ email: normalizedEmail })) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = generateOtp();

//     const [user] = await UserModel.create(
//       [
//         {
//           name,
//           email: normalizedEmail,
//           password: hashedPassword,
//           otp,
//           otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
//           mobile,
//           address,
//           countryId,
//           stateId,
//           cityId,
//           collegeId,
//           classId,
//           admissionYear,
//           signUpBy: 'email',
//           role: 'user',
//         },
//       ],
//       { session }
//     );

//     await sendFormEmail(normalizedEmail, otp);

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       message: 'User registered successfully. Please verify your email.',
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     next(error);
//   }
// };


<<<<<<< HEAD
=======

>>>>>>> b12b495d930749376ce0840f08014738738999ab
export const register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      mobile,
      address,
      stateId,
      cityId,
      collegeName,
      classId,
      admissionYear,
      password,
    } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password || !stateId || !cityId || !collegeName) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Email, Password, State, City, College Name) are required.'
      });
    }

    // 2. Active State Check
    const activeState = await State.findOne({ _id: stateId, isActive: true });
    if (!activeState) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Selected state is not active for registration.' });
    }

    // 3. City Validation
    const cityExists = await City.findOne({ _id: cityId, stateId });
    if (!cityExists) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid city selection for this state.' });
    }

    // 4. Dynamic College Logic
    let college = await College.findOne({
      name: { $regex: new RegExp(`^${collegeName.trim()}$`, 'i') },
      cityId
    }).session(session);

    if (!college) {
      const createdColleges = await College.create([{
        name: collegeName.trim(),
        cityId,
        stateId,
        isActive: true
      }], { session });
      college = createdColleges[0];
    }

    // 5. Class Validation
    const classExists = await ClassModel.findById(classId);
    if (!classExists) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid class selected.' });
    }

    // 6. Password & User Existence
    if (password.length < 6) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 7. Create User
    const [user] = await UserModel.create(
      [
        {
          name,
          email: normalizedEmail,
          password: password, // ✅ Plain password bhejein, Model ise hash kar dega
          otp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          mobile,
          address,
          stateId,
          cityId,
          collegeId: college._id,
          classId,
          admissionYear,
          signUpBy: 'email',
          role: 'user',
        },
      ],
      { session }
    );

    // 8. Commit and Cleanup
    await session.commitTransaction();
    session.endSession();

    // 9. Fetch Populated Data for Response
    const populatedUser = await UserModel.findById(user._id)
      .populate('stateId', 'name')
      .populate('cityId', 'name')
      .populate('collegeId', 'name')
      .populate('classId', 'name');

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: populatedUser
    });

  } catch (error) {

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

    const { accessToken, refreshToken } = generateToken(user._id);

    // ✅ safe user object
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
    };

    res.json({
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const normalizedEmail = email.toLowerCase().trim();

//     // ✅ ADD: basic validation
//     if (!email || !password) {
//       return res.status(400).json({
//         message: 'Email and password are required',
//       });
//     }

//     // ✅ Ensure password is selected
//     const user = await UserModel.findOne({ email: normalizedEmail }).select(
//       '+password'
//     );
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.status !== 'active') {
//       return res.status(403).json({
//         message: 'Account is blocked or inactive',
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     if (!user.isEmailVerified) {
//       return res.status(401).json({ message: 'Email not verified' });
//     }

//     const { accessToken, refreshToken } = generateToken(user._id);

//     // ✅ REMOVE sensitive fields
//     const safeUser = user.toObject();
//     delete safeUser.password;
//     delete safeUser.otp;
//     delete safeUser.otpExpiresAt;

//     res.json({
//       message: 'Login successful',
//       user: safeUser,
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // 1. ✅ Validation Pehle (Taaki undefined.toLowerCase() wala crash na ho)
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required',
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     // 2. User dhundo password ke saath
//     const user = await UserModel.findOne({ email: normalizedEmail }).select('+password');

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // 3. Status check
//     if (user.status !== 'active') {
//       return res.status(403).json({
//         success: false,
//         message: 'Account is blocked or inactive',
//       });
//     }

//     // 4. Password Match
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     // 5. Verification check
//     if (!user.isEmailVerified) {
//       return res.status(401).json({ success: false, message: 'Email not verified' });
//     }

//     // 6. Token Generation
//     const { accessToken, refreshToken } = generateToken(user._id);

//     // ✅ 7. DATABASE MEIN TOKEN SAVE KARNA
//     user.refreshToken = refreshToken;
//     await user.save(); // Model mein laga 'pre-save' hook isModified check ki wajah se password ko safe rakhega

//     // 8. Sensitive fields hatana
//     const safeUser = user.toObject();
//     delete safeUser.password;
//     delete safeUser.refreshToken; // Response ke user object mein token dikhane ki zaroorat nahi
//     delete safeUser.otp;
//     delete safeUser.otpExpiresAt;

//     // 9. Final Response
//     res.json({
//       success: true,
//       message: 'Login successful',
//       accessToken,   // Frontend ke liye
//       refreshToken,  // Frontend ke liye
//       user: safeUser,
//     });
//   } catch (error) {
//     next(error);
//   }
// };



export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation Pehle
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. User dhundo password ke saath
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 3. Status aur Password check
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is blocked or inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: 'Email not verified' });
    }

    // --- ✅ TOKENS GENERATE KARNA ---
    // Note: ensure generateToken.js { accessToken, refreshToken } return kare
    const tokens = generateToken(user._id);

    // Agar generateToken sirf ek string return kar raha hai, toh hum manually handle karenge
    const accessToken = tokens.accessToken || tokens;
    const refreshToken = tokens.refreshToken || tokens;

    // --- ✅ DATABASE MEIN SAVE KARNA ---
    user.refreshToken = refreshToken;

    // user.save() karne par model ka pre-save hook chalega
    // par isModified('password') false hoga, isliye password hash kharab nahi hoga
    await user.save();

    // 4. Safe User object
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.refreshToken; // Response se hatana zaroori hai
    delete safeUser.otp;
    delete safeUser.otpExpiresAt;

    // --- ✅ FINAL RESPONSE (Token yahan hone chahiye) ---
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,   // Postman mein dikhega
      refreshToken,  // Postman mein dikhega
      user: safeUser,
    });

  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ ADD: basic validation
    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(200)
        .json({ message: 'If this email exists, an OTP has been sent' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email already verified',
      });
    }

    // ✅ ADD: OTP resend cooldown (anti-spam)
    if (
      user.otpExpiresAt &&
      user.otpExpiresAt.getTime() - Date.now() > 9 * 60 * 1000
    ) {
      return res.status(429).json({
        message: 'Please wait before requesting another OTP',
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sendFormEmail(email, otp);
    await user.save();

    res.json({ message: 'OTP resent successfully' });
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

    // ✅ ADD: OTP spam protection
    if (
      user.otpExpiresAt &&
      user.otpExpiresAt.getTime() - Date.now() > 9 * 60 * 1000
    ) {
      return res.status(429).json({
        message: 'Please wait before requesting another OTP',
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sendFormEmail(email, otp);
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
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

    const userData = await UserModel.findById(id).select(
      '-password -otp -otpExpiresAt'
    );

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
      'collegeId',
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

    // ✅ LOCATION VALIDATION (PRODUCTION CRITICAL)
    const { countryId, stateId, cityId } = updateData;

    if (countryId && stateId && cityId) {
      const validCity = await City.findOne({
        _id: cityId,
        stateId,
        countryId,
      });

      if (!validCity) {
        return res.status(400).json({
          success: false,
          message: 'Invalid country, state, city combination',
        });
      }
    }
    // ✅ COLLEGE VALIDATION
    if (updateData.collegeId) {
      const validCollege = await College.findById(updateData.collegeId);
      if (!validCollege) {
        return res.status(400).json({
          success: false,
          message: 'Invalid college',
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
    );

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

export const getSubjectsByUser = async (req, res) => {
  try {
    // 1. Agar aapko kisi specific course ke subjects chahiye (e.g. ?courseId=123)
    const { courseId } = req.query;

    let filter = { status: 'active' }; // Sirf active subjects dikhayenge
    if (courseId) {
      filter.courseId = courseId;
    }

    // 2. Database se subjects nikalna
    // .select() ka use karke hum sirf wahi data bhejenge jo user ko chahiye
    // .sort() se 'order' ke hisaab se list dikhegi
    const subjects = await Subject.find(filter)
      .select('name description order')
      .sort({ order: 1 });

    // 3. Response bhejna
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Subjects fetch nahi ho paye',
      error: error.message,
    });
  }
};

// Pearl model import karein (agar count dikhana hai)
// import Pearl from '../../models/admin/Pearl.js';

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

export const getSubSubjectsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.query; // Frontend se subjectId aayegi

    if (!subjectId) {
      return res
        .status(400)
        .json({ success: false, message: 'subjectId is required' });
    }

    // Database se wahi sub-subjects nikalna jo is subjectId se linked hain
    const subSubjects = await SubSubject.find({
      subjectId: subjectId,
      status: 'active',
    })
      .select('name order')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: subSubjects.length,
      data: subSubjects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopicsWithChaptersForUser = async (req, res) => {
  try {
    const { subSubjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subSubjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subSubjectId',
      });
    }

    // 1) Is sub-subject ke ACTIVE chapters
    const chapters = await Chapter.find({
      subSubjectId,
      status: 'active',
    })
      .select('name topicId order')
      .sort({ order: 1 })
      .lean();

    // 2) Topic IDs nikaalo (duplicate remove)
    const topicIds = [
      ...new Set(
        chapters.filter((c) => c.topicId).map((c) => c.topicId.toString())
      ),
    ];

    // 3) Un topicIds ke ACTIVE topics
    const topics = await Topic.find({
      _id: { $in: topicIds },
      status: 'active',
    })
      .select('name description order')
      .sort({ order: 1 })
      .lean();

    // 4) Topic-wise chapters group karo
    const topicMap = {};
    topics.forEach((t) => {
      topicMap[t._id.toString()] = {
        _id: t._id,
        name: t.name,
        description: t.description,
        order: t.order,
        chapters: [],
      };
    });

    chapters.forEach((ch) => {
      const key = ch.topicId?.toString();
      if (topicMap[key]) {
        topicMap[key].chapters.push({
          _id: ch._id,
          name: ch.name,
          order: ch.order,
        });
      }
    });

    res.status(200).json({
      success: true,
      count: Object.values(topicMap).length,
      data: Object.values(topicMap),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

export const getMcqsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      return res
        .status(400)
        .json({ success: false, message: 'chapterId is required' });
    }

    const mcqs = await MCQ.find({ chapterId, status: 'active' })
      .select('-createdBy -updatedBy') // Admin details ki zaroorat nahi hai
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: mcqs.length,
      data: mcqs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// B. Test Submit karke Result Calculate karna
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
export const getActivePlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });
    res.status(200).json({ success: true, data: plans });
  } catch (error) { next(error); }
};

// 2. Buy Subscription (Final Step after Payment)
export const buySubscription = async (req, res, next) => {
  try {
    const { planId, months, paymentId, orderId } = req.body;
    const userId = req.user._id;

    // Plan check karein
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Price confirm karein
    const selectedPricing = plan.pricing.find(p => p.months === Number(months));
    if (!selectedPricing) return res.status(400).json({ message: "Invalid duration" });

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
        selectedMonths: months
      },
      subscriptionStatus: status
    });

    // Transaction save karein
    await TransactionModel.create({
  userId,
  planId,
  razorpay_payment_id: paymentId,
  razorpay_order_id: orderId,
  amount: selectedPricing.price,
  months: Number(months)
});

    res.status(200).json({
      success: true,
      message: "Subscription activated successfully!",
      expiryDate: endDate
    });
  } catch (error) { next(error); }
};
export const getMySubscription = async (req, res) => {
  try {
    const user_id = req.user._id;
    const user = await UserModel.findById(user_id)
      .select('subscription subscriptionStatus')
      .populate('subscription.plan_id', 'name features');

    if (!user.subscription || !user.subscription.isActive) {
      return res.status(200).json({ status: true, message: "No active subscription found", data: null });
    }

    res.status(200).json({ status: true, data: user });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
}
 export const postRating = async (req, res) => {
      try {
        const { rating, review } = req.body;
        const userId = req.user._id; // Auth middleware se milega

        if (!rating) {
          return res.status(400).json({ success: false, message: "Rating is required" });
        }

        const newRating = await Rating.create({
          userId,
          rating,
          review
        });

        res.status(201).json({
          success: true,
          message: "Thank you for your rating!",
          data: newRating
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    };


  export const getAllSubSubjectsForUser = async (req, res) => {
    try {
      const { courseId } = req.query; // Course ke base par filter zaroori hai

      if (!courseId) {
        return res.status(400).json({ success: false, message: "courseId is required" });
      }

      // Pure course ke saare active sub-subjects fetch karna
      const subSubjects = await SubSubject.find({
        courseId: courseId,
        status: 'active'
      }).sort({ order: 1 });

      res.status(200).json({
        success: true,
        data: subSubjects
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

