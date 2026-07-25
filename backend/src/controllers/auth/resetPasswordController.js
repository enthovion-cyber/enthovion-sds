const { verifyResetToken } = require('../../services/auth/jwtService');
const { hashPassword } = require('../../services/auth/passwordService');
const userModel = require('../../models/userModel');
const { supabaseAdmin } = require('../../config/database');
const { success, badRequest } = require('../../utils/responseHelper');

const resetPasswordController = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  let decoded;
  try {
    decoded = verifyResetToken(resetToken);
  } catch {
    return badRequest(res, 'Reset token is invalid or has expired. Please request a new code.');
  }

  const passwordHash = await hashPassword(newPassword);
  await userModel.updatePassword(decoded.userId, passwordHash);

  // Revoke all existing refresh tokens — forces re-login everywhere
  await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', decoded.userId)
    .is('revoked_at', null);

  return success(res, null, 'Password reset successfully. Please log in with your new password.');
};

module.exports = resetPasswordController;
