const sdsModel = require('../../models/sdsModel');
const { success } = require('../../utils/responseHelper');

const getDashboardStatsController = async (req, res) => {
  const stats = await sdsModel.getDashboardStats(req.user.userId);
  return success(res, stats);
};

module.exports = getDashboardStatsController;
