import jwt from 'jsonwebtoken';
import Admin from '../models/admin/admin.model.js';
import UserModel from '../models/user/userModel.js';

/**
 * Unified JWT authentication middleware
 * - Admin token → req.admin set hoga
 * - User token → req.user set hoga
 * - Same JWT secret use hota hai
 * - Safe & production-ready
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔹 Pehle ADMIN me check karo
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        req.admin = admin;
        return next();
      }

      // 🔹 Agar admin nahi mila, USER me check karo
      const user = await UserModel.findById(decoded.id).select(
        '-password -otp -otpExpiresAt'
      );

      if (user) {
        if (user.status !== 'active') {
          return res.status(403).json({
            success: false,
            message: 'User is blocked or inactive',
          });
        }

        req.user = user;
        return next();
      }

      // 🔴 Na admin mila na user
      return res.status(401).json({
        success: false,
        message: 'User or Admin not found',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, no token',
  });
};
