const userModel = require('../../models/userModel');
const { success } = require('../../utils/responseHelper');

const getProfileController = async (req, res) => {
  const user = await userModel.findById(req.user.userId);
  return success(res, userModel.sanitise(user));
};

module.exports = getProfileController;
