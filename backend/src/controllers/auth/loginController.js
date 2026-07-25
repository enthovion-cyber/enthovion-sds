const userModel = require('../../models/userModel');
const { verifyPassword } = require('../../services/auth/passwordService');
const { signAccessToken, signRefreshToken } = require('../../services/auth/jwtService');
const { supabaseAdmin } = require('../../config/database');
const { success, unauthorized } = require('../../utils/responseHelper');

const loginController = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) return unauthorized(res, 'Invalid email or password');

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) return unauthorized(res, 'Invalid email or password');

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token hash in DB for revocation support
  await supabaseAdmin.from('refresh_tokens').insert({
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return success(res, {
    accessToken,
    refreshToken,
    user: userModel.sanitise(user),
  }, 'Login successful');
};

module.exports = loginController;
