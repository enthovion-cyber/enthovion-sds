const userModel = require('../../models/userModel');
const { verifyPassword, hashPassword } = require('../../services/auth/passwordService');
const { success, badRequest } = require('../../utils/responseHelper');

const changePasswordController = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;

  const user = await userModel.findById(userId);
  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) return badRequest(res, 'Current password is incorrect');

  const isSame = await verifyPassword(newPassword, user.password_hash);
  if (isSame) return badRequest(res, 'New password must be different from your current password');

  const passwordHash = await hashPassword(newPassword);
  await userModel.updatePassword(userId, passwordHash);

  return success(res, null, 'Password changed successfully');
};

module.exports = changePasswordController;
