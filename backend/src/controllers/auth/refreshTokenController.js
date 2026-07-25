const { verifyRefreshToken, signAccessToken } = require('../../services/auth/jwtService');
const { supabaseAdmin } = require('../../config/database');
const { success, unauthorized } = require('../../utils/responseHelper');

const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return unauthorized(res, 'Refresh token required');

  // Verify JWT signature
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return unauthorized(res, 'Invalid or expired refresh token');
  }

  // Check token is not revoked in DB
  const { data: storedToken } = await supabaseAdmin
    .from('refresh_tokens')
    .select('*')
    .eq('token', refreshToken)
    .is('revoked_at', null)
    .single();

  if (!storedToken) return unauthorized(res, 'Refresh token has been revoked');

  const accessToken = signAccessToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  });

  return success(res, { accessToken }, 'Token refreshed');
};

module.exports = refreshTokenController;
