const sdsModel = require('../../models/sdsModel');
const { success, paginated, notFound } = require('../../utils/responseHelper');

const getAllSdsController = async (req, res) => {
  const { page = 1, limit = 20, q, status, language, jurisdiction } = req.query;
  const { data, total } = await sdsModel.findAll({
    userId: req.user.userId,
    page: parseInt(page),
    limit: parseInt(limit),
    search: q,
    status,
    language,
    jurisdiction,
  });
  return paginated(res, data, total, page, limit);
};

module.exports = getAllSdsController;
