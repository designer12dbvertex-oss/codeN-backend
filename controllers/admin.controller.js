import Admin from '../models/admin.model.js';
import generateToken from '../config/generateToken.js';

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // ONLY admin allowed
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

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Regenerate a fresh token, overwrite stored token and save
  const newToken = generateToken(admin._id);
  admin.token = newToken;
  await admin.save();

  res.status(200).json({
    success: true,
    token: newToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
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
