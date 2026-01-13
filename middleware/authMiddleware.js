import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

/**
 * JWT authentication middleware
 * Request mein se JWT token verify karta hai
 * Agar token valid hai to admin ko req.admin mein set karta hai
 */
export const protect = async (req, res, next) => {
  let token;

  // Token ko header se extract karo
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // "Bearer <token>" format se token nikal lo
      token = req.headers.authorization.split(' ')[1];

      // Token ko verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Admin ko database se fetch karo (password exclude karke)
      req.admin = await Admin.findById(decoded.id).select('-password');

      // Agar admin nahi mila
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found', // Admin nahi mila
        });
      }

      next(); // Next middleware ko call karo
    } catch (error) {
      // Token invalid hai ya expire ho gaya
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed', // Token fail ho gaya
      });
    }
  }

  // Agar token nahi mila
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token', // Token nahi mila
    });
  }
};

