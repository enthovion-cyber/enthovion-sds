const sdsModel = require('../../models/sdsModel');
const { success, paginated, notFound } = require('../../utils/responseHelper');

const getAllSdsController = async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    status, 
    compliance_status,
    validation_status,
    publication_status,
    review_due,
    language, 
    jurisdiction,
    sort
  } = req.query;

  const { data, total } = await sdsModel.findAll({
    userId: req.user.userId,
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    status,
    compliance_status,
    validation_status,
    publication_status,
    review_due,
    language,
    jurisdiction,
    sort
  });
  
  return paginated(res, data, total, page, limit);
};

module.exports = getAllSdsController;
