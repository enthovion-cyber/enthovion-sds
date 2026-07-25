const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
    issuer: 'safesheet-ai',
  });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
    issuer: 'safesheet-ai',
  });
};

const signEmailVerifyToken = (userId, email) => {
  return jwt.sign({ userId, email, purpose: 'email_verify' }, env.jwt.emailVerifySecret, {
    expiresIn: env.jwt.emailVerifyExpiresIn,
    issuer: 'safesheet-ai',
  });
};

const signResetToken = (userId) => {
  return jwt.sign({ userId, purpose: 'password_reset' }, env.jwt.resetSecret, {
    expiresIn: env.jwt.resetExpiresIn,
    issuer: 'safesheet-ai',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};

const verifyEmailToken = (token) => {
  return jwt.verify(token, env.jwt.emailVerifySecret);
};

const verifyResetToken = (token) => {
  const decoded = jwt.verify(token, env.jwt.resetSecret);
  if (decoded.purpose !== 'password_reset') {
    throw new Error('Invalid token purpose');
  }
  return decoded;
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  signEmailVerifyToken,
  signResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailToken,
  verifyResetToken,
};
