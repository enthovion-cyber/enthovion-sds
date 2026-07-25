const userModel = require('../../models/userModel');
const { verifyOtp } = require('../../services/auth/otpService');
const { signResetToken } = require('../../services/auth/jwtService');
const { success, badRequest, notFound } = require('../../utils/responseHelper');

const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) return notFound(res, 'User not found');

  try {
    await verifyOtp(user.id, otp, 'forgot_password');
  } catch (err) {
    return badRequest(res, err.message);
  }

  // Issue one-time reset token valid for 15 minutes
  const resetToken = signResetToken(user.id);

  return success(res, { resetToken }, 'OTP verified. Use resetToken to set a new password.');
};

module.exports = verifyOtpController;
