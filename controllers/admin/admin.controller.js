import Admin from '../../models/admin/admin.model.js';
import generateToken from '../../config/generateToken.js';
import PageModel from '../../models/admin/pageModel.js';
import UserModel from '../../models/user/userModel.js';
import Rating from "../../models/admin/Rating.js"

export const loginAdmin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    email = email.toLowerCase().trim(); // 🔹 FIX 1

    const admin = await Admin.findOne({
      email,
      role: 'admin',
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    if (admin.status !== 'active') {
      // 🔹 FIX 2
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive',
      });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const newToken = generateToken(admin._id);
    admin.token = newToken;
    admin.lastLogin = new Date(); // 🔹 FIX 3
    await admin.save();
    res.status(200).json({
      success: true,
      token: newToken,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * GET LOGGED-IN ADMIN PROFILE
 */
export const getAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('-password');

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found',
    });
  }

  res.json({
    success: true,
    data: admin,
  });
};

/**
 * UPDATE ADMIN PROFILE (SELF)
 * Allowed fields only
 */
// UPDATE ADMIN PROFILE (SELF)
export const updateAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found',
    });
  }

  // text fields
  if (req.body.name) admin.name = req.body.name;
  if (req.body.phone) admin.phone = req.body.phone;

  // image upload (NEW)
  if (req.file) {
    admin.profileImage = `/uploads/admin-profile/${req.file.filename}`;
  }

  await admin.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      profileImage: admin.profileImage,
      role: admin.role,
    },
  });
};

/**
 * CHANGE ADMIN PASSWORD
 */
export const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    });
  }

  const admin = await Admin.findById(req.admin._id).select('+password');

  const isMatch = await admin.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from old password',
    });
  }

  admin.password = newPassword;
  admin.token = null; // invalidate old token
  await admin.save();

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  });
};
export const addSlug = async (req, res, next) => {
  try {
    const { slug, title, content } = req.body;

    if (!slug || !title || !content) {
      return res.status(400).json({
        message: 'slug, title and content are required',
      });
    }

    const existingPage = await PageModel.findOne({ slug });

    if (existingPage) {
      existingPage.title = title;
      existingPage.content = content;

      await existingPage.save();

      return res.status(200).json({
        message: 'Page updated successfully',
        data: existingPage,
      });
    }

    const page = await PageModel.create({
      slug,
      title,
      content,
    });

    res.status(201).json({
      message: 'Page created successfully',
      data: page,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────
// GET ALL USERS (ADMIN PANEL)
// ───────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    // Sirf admin allowed
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access only',
      });
    }

    const users = await UserModel.find()
      .select('-password -otp -otpExpiresAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('userId', 'name email image') // User ki details fetch karne ke liye
      .sort({ createdAt: -1 }); // Latest ratings sabse upar

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
