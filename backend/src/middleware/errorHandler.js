const env = require('../config/env');
const { error } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (env.isDev) console.error(err.stack);

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expired', 401);
  }

  // Joi validation errors
  if (err.isJoi || err.name === 'ValidationError') {
    const messages = err.details
      ? err.details.map((d) => d.message.replace(/"/g, ''))
      : [err.message];
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return error(res, 'File too large. Maximum size is 20MB.', 413);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return error(res, 'Unexpected file field', 400);
  }

  // CORS
  if (err.message && err.message.startsWith('CORS')) {
    return error(res, err.message, 403);
  }

  // Default 500
  const statusCode = err.statusCode || err.status || 500;
  const message = env.isDev ? err.message : 'Internal server error';
  return error(res, message, statusCode);
};

module.exports = errorHandler;
