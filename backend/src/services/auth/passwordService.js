const { hash, compare } = require('../../utils/hashHelper');

const MIN_LENGTH = 8;

const hashPassword = async (plainPassword) => {
  return hash(plainPassword);
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return compare(plainPassword, hashedPassword);
};

/**
 * Checks password strength.
 * Returns { strong: true } or { strong: false, reason: '...' }
 */
const checkStrength = (password) => {
  if (password.length < MIN_LENGTH) {
    return { strong: false, reason: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (!/[A-Z]/.test(password)) {
    return { strong: false, reason: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { strong: false, reason: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { strong: false, reason: 'Password must contain at least one number' };
  }
  return { strong: true };
};

module.exports = { hashPassword, verifyPassword, checkStrength };
