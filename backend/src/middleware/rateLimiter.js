const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const buildRateLimitHandler = (defaultMessage) => (req, res) => {
  const retryAfterHeader = res.getHeader('Retry-After');
  const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10);

  return res.status(429).json({
    success: false,
    message: defaultMessage,
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
    path: req.originalUrl,
  });
};

// Global rate limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === '/health' ||
    Boolean(req.headers.authorization) ||
    String(req.headers.cookie || '').includes('accessToken='),
  handler: buildRateLimitHandler('Too many requests. Please try again later.'),
});

// Strict limiter for auth routes — prevents brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildRateLimitHandler('Too many authentication attempts. Please try again in 15 minutes.'),
  skipSuccessfulRequests: true, // Only count failed requests
});

// OTP / email limiter — 3 per hour
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildRateLimitHandler('Too many OTP requests. Please try again in 1 hour.'),
});

// AI generation limiter — prevent abuse of expensive AI calls
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildRateLimitHandler('AI generation limit reached. Please try again in 1 hour.'),
});

module.exports = { globalLimiter, authLimiter, otpLimiter, aiLimiter };
