const { verifyEmailToken } = require('../../services/auth/jwtService');
const { sendWelcomeEmail } = require('../../services/auth/emailService');
const userModel = require('../../models/userModel');
const { success, badRequest } = require('../../utils/responseHelper');

const emailVerifyController = async (req, res) => {
  const { token } = req.query;
  if (!token) return badRequest(res, 'Verification token is required');

  let decoded;
  try {
    decoded = verifyEmailToken(token);
  } catch {
    return badRequest(res, 'Verification link is invalid or has expired. Please request a new one.');
  }

  const user = await userModel.findById(decoded.userId);
  if (!user) return badRequest(res, 'User not found');

  if (user.email_verified) {
    return success(res, null, 'Email already verified. You can log in.');
  }

  await userModel.updateEmailVerified(decoded.userId);
  await sendWelcomeEmail(user.email, user.name);

  return success(res, null, 'Email verified successfully. Welcome to SafeSheet AI!');
};

module.exports = emailVerifyController;
