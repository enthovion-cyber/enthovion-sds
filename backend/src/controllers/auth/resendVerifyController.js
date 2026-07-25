const userModel = require('../../models/userModel');
const { signEmailVerifyToken } = require('../../services/auth/jwtService');
const { sendVerifyEmail } = require('../../services/auth/emailService');
const { success, badRequest } = require('../../utils/responseHelper');

const resendVerifyController = async (req, res) => {
  const { userId, email } = req.user;

  const user = await userModel.findById(userId);
  if (user.email_verified) {
    return badRequest(res, 'Your email is already verified');
  }

  const verifyToken = signEmailVerifyToken(userId, email);
  await sendVerifyEmail(email, verifyToken, user.name);

  return success(res, null, 'Verification email sent. Please check your inbox.');
};

module.exports = resendVerifyController;
