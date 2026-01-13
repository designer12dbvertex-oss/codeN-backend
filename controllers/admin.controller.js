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
