const sdsModel = require('../../models/sdsModel');
const { success } = require('../../utils/responseHelper');

const getExpiringController = async (req, res) => {
  const days = parseInt(req.query.days) || 90;
  const data = await sdsModel.findExpiring(req.user.userId, days);
  return success(res, data);
};

module.exports = getExpiringController;
