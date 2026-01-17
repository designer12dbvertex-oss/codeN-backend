import bcrypt from 'bcryptjs';
import UserModel from '../../models/user/userModel.js';
import { sendFormEmail } from '../../config/mail.js';
import PageModel from '../../models/admin/pageModel.js';
import generateToken from '../../config/generateToken.js';

export const loginByGoogle = async (req, res, next) => {
  try {
    const { access_token } = req.body;

    // ✅ Validate token
    if (!access_token) {
      return res.status(400).json({
        message: 'Google access token is required',
      });
    }

    const googleRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!googleRes.ok) {
      return res.status(401).json({
        message: 'Invalid Google token',
      });
    }

    const profile = await googleRes.json();

    // ✅ Normalize & validate email
    const email = profile.email?.toLowerCase().trim();
    if (!email) {
      return res.status(400).json({
        message: 'Google account email not available',
      });
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        name: profile.name,
        email,
        signUpBy: 'google',
        isEmailVerified: true,
      });
    }

    // ✅ Blocked / inactive check (VERY IMPORTANT)
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is blocked or inactive',
      });
    }

    const token = await generateToken(user._id);

    // ✅ Safe user object
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpiresAt;

    return res.status(200).json({
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      mobile,
      address,
      countryId,
      stateId,
      cityId,
      collegeId,
      classId,
      admissionYear,
      password,
    } = req.body;

    // ✅ ADD: basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    await UserModel.create({
      name,
      email,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      password: hashedPassword,
      mobile,
      address,
      countryId,
      stateId,
      cityId,
      collegeId,
      classId,
      admissionYear,
      signUpBy: 'email',
    });

    await sendFormEmail(email, otp);

    // ✅ REMOVE user object from response
    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // ✅ basic validation
    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
      });
    }

    const user = await UserModel.findOne({ email });
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

    const token = await generateToken(user._id);

    // ✅ safe user object
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
    };

    res.json({
      message: 'Email verified successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ✅ ADD: basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // ✅ Ensure password is selected
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is blocked or inactive',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    const token = await generateToken(user._id);

    // ✅ REMOVE sensitive fields
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpiresAt;

    res.json({
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // ✅ ADD: basic validation
    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

    // ✅ ADD: input validation
    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const user = await UserModel.findOne({ email });

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

    const user = await UserModel.findOne({ email }).select('+password');

    // ✅ ADD: generic response
    if (!user) {
      return res.status(400).json({
        message: 'Invalid OTP or request expired',
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

import mongoose from 'mongoose';

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
