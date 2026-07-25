const jwtService = require('../services/auth/jwtService');
const userModel = require('../models/userModel');
const { unauthorized, forbidden } = require('../utils/responseHelper');

/**
 * authenticate — verifies Bearer token, attaches req.user
 * Apply to all protected routes
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyAccessToken(token);

    // Fetch fresh user data (catches disabled/deleted users)
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return unauthorized(res, 'User no longer exists');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.email_verified,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireEmailVerified — blocks users who haven't verified their email
 * Apply after authenticate on sensitive routes
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user.emailVerified) {
    return forbidden(res, 'Please verify your email address before continuing');
  }
  next();
};

module.exports = { authenticate, requireEmailVerified };
