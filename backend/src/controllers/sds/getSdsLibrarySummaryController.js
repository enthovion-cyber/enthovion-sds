const sdsModel = require('../../models/sdsModel');
const { success } = require('../../utils/responseHelper');

const getSdsLibrarySummaryController = async (req, res) => {
  try {
    const summary = await sdsModel.getLibrarySummaryStats(req.user.userId);
    return success(res, summary);
  } catch (error) {
    throw error;
  }
};

module.exports = getSdsLibrarySummaryController;
