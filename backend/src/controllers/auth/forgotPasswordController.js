const userModel = require('../../models/userModel');
const { generateOtp } = require('../../services/auth/otpService');
const { sendOtpEmail } = require('../../services/auth/emailService');
const { success } = require('../../utils/responseHelper');

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  // Always return the same message — never confirm if email exists (security)
  const GENERIC_MSG = 'If an account with that email exists, you will receive a reset code shortly.';

  const user = await userModel.findByEmail(email);
  if (!user) return success(res, null, GENERIC_MSG);

  const otp = await generateOtp(user.id, 'forgot_password');
  await sendOtpEmail(email, otp, user.name);

  return success(res, null, GENERIC_MSG);
};

module.exports = forgotPasswordController;
