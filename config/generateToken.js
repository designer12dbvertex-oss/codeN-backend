import jwt from 'jsonwebtoken';

/**
 * JWT token generate karne ke liye function
 * Admin ke liye JWT token banata hai
 *
 * @param {string} adminId - Admin ka unique ID
 * @returns {string} - JWT token
 */
const generateToken = (adminId) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d', // Default 30 days
    }
  );
};

export default generateToken;

