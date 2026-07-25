const sopModel = require('../../models/sopModel');
const { success, notFound } = require('../../utils/responseHelper');

const getSopByIdController = async (req, res) => {
  const sop = await sopModel.findById(req.params.id);
  if (!sop) return notFound(res, 'SOP not found');
  return success(res, sop);
};

module.exports = getSopByIdController;
