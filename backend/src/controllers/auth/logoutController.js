const { supabaseAdmin } = require('../../config/database');
const { success } = require('../../utils/responseHelper');

const logoutController = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Revoke the specific refresh token
    await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token', refreshToken)
      .eq('user_id', req.user.userId);
  }

  return success(res, null, 'Logged out successfully');
};

module.exports = logoutController;
