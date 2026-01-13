/**
 * Global error handling middleware
 * Sabhi errors ko handle karta hai aur consistent response deta hai
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error ko console mein
  console.error(err);

  // Mongoose bad ObjectId error
  if (err.name === 'CastError') {
    const message = 'Resource not found'; // Resource nahi mila
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'; // Duplicate value
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'; // Invalid token
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'; // Token expire ho gaya
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error', // Server error
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Development mein stack trace dikhao
  });
};

/**
 * Not found middleware
 * Agar route nahi mila to yeh middleware chalega
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`); // Route nahi mila
  res.status(404);
  next(error);
};

