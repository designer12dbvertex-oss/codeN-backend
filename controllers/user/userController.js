import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
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
import SubscriptionPlan from '../../models/admin/SubscriptionPlan/scriptionplan.model.js';
import TransactionModel from '../../models/admin/Transaction/Transaction.js';

// import Course from '../../models/admin/Course/course.model.js';

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
        role: 'user',
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

    // ✅ BASIC VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    // ✅ LOCATION & CLASS VALIDATION (THIS WAS MISSING PLACE)
    if (!(await Country.findById(countryId))) {
      return res.status(400).json({ message: 'Invalid country' });
    }

    if (!(await State.findOne({ _id: stateId, countryId }))) {
      return res.status(400).json({ message: 'Invalid state' });
    }

    if (!(await City.findOne({ _id: cityId, stateId, countryId }))) {
      return res.status(400).json({ message: 'Invalid city' });
    }

    if (
      !(await College.findOne({
        _id: collegeId,
        cityId,
        stateId,
        countryId,
      }))
    ) {
      return res.status(400).json({ message: 'Invalid college' });
    }

    if (!(await ClassModel.findById(classId))) {
      return res.status(400).json({ message: 'Invalid class' });
    }

    // ✅ PASSWORD VALIDATION
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    await UserModel.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      mobile,
      address,
      countryId,
      stateId,
      cityId,
      collegeId,
      classId,
      admissionYear,
      signUpBy: 'email',
      role: 'user',
    });

    await sendFormEmail(email, otp);

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
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
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ ADD: basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // ✅ Ensure password is selected
    const user = await UserModel.findOne({ email: normalizedEmail }).select(
      '+password'
    );
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
        path: 'chapterId',
        select: 'name subSubjectId',
        populate: {
          path: 'subSubjectId',
          select: 'name',
        },
      })
      .select('name description order chapterId')
      .sort({ createdAt: -1 });

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

    const topics = await Topic.find({
      chapterId,
      status: 'active',
    })
      .select('name description order chapterId')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    res.status(400).json({
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
        path: 'chapterId',
        select: 'name subSubjectId',
        populate: {
          path: 'subSubjectId',
          select: 'name',
        },
      })
      .select('name description order chapterId');

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
};
