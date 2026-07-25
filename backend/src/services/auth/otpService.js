const crypto = require('crypto');
const { hash, compare } = require('../../utils/hashHelper');
const otpModel = require('../../models/otpModel');
const env = require('../../config/env');

/**
 * Generates a 6-digit OTP, bcrypt-hashes it, stores in DB, returns plain code.
 * The plain code is emailed to the user — never stored.
 */
const generateOtp = async (userId, purpose = 'forgot_password') => {
  // Invalidate any previous unused OTPs for this user+purpose
  await otpModel.invalidatePrevious(userId, purpose);

  const plainOtp = crypto.randomInt(100000, 999999).toString();
  const codeHash = await hash(plainOtp);

  const expiresAt = new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000);

  await otpModel.create({
    user_id: userId,
    code_hash: codeHash,
    purpose,
    expires_at: expiresAt.toISOString(),
  });

  return plainOtp;
};

/**
 * Verifies a submitted OTP code.
 * Returns { valid: true } or throws an error with a specific code.
 */
const verifyOtp = async (userId, submittedCode, purpose = 'forgot_password') => {
  const otpRecord = await otpModel.findLatest(userId, purpose);

  if (!otpRecord) {
    const err = new Error('OTP not found or already used');
    err.code = 'AUTH_OTP_INVALID';
    throw err;
  }

  if (otpRecord.used_at) {
    const err = new Error('OTP has already been used');
    err.code = 'AUTH_OTP_ALREADY_USED';
    throw err;
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    const err = new Error('OTP has expired');
    err.code = 'AUTH_OTP_EXPIRED';
    throw err;
  }

  const isValid = await compare(submittedCode, otpRecord.code_hash);
  if (!isValid) {
    const err = new Error('Invalid OTP code');
    err.code = 'AUTH_OTP_INVALID';
    throw err;
  }

  // Mark as used
  await otpModel.markUsed(otpRecord.id);
  return { valid: true };
};

/**
 * Cleanup job — delete expired OTPs (called by cron)
 */
const cleanupExpired = async () => {
  const count = await otpModel.deleteExpired();
  console.log(`[OTP Cleanup] Deleted ${count} expired OTP records`);
};

module.exports = { generateOtp, verifyOtp, cleanupExpired };
