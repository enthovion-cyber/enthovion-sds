const userModel = require('../../models/userModel');
const { hashPassword } = require('../../services/auth/passwordService');
const { signEmailVerifyToken } = require('../../services/auth/jwtService');
const { sendVerifyEmail } = require('../../services/auth/emailService');
const { created, conflict } = require('../../utils/responseHelper');

const registerController = async (req, res) => {
  const { name, email, password, role, company } = req.body;

  const existing = await userModel.findByEmail(email);
  if (existing) return conflict(res, 'An account with this email already exists');

  const passwordHash = await hashPassword(password);
  const user = await userModel.create({ name, email, passwordHash, role, company });

  const verifyToken = signEmailVerifyToken(user.id, email);
  await sendVerifyEmail(email, verifyToken, name);

  return created(res, { userId: user.id, email: user.email },
    'Account created. Please check your email to verify your account.');
};

module.exports = registerController;
