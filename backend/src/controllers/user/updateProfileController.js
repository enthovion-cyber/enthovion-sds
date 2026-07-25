const userModel = require('../../models/userModel');
const { success } = require('../../utils/responseHelper');

const updateProfileController = async (req, res) => {
  const updated = await userModel.updateProfile(req.user.userId, req.body);
  return success(res, userModel.sanitise(updated), 'Profile updated');
};

module.exports = updateProfileController;
