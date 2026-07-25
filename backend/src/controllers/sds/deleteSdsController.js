const sdsModel = require('../../models/sdsModel');
const { success, notFound } = require('../../utils/responseHelper');

const deleteSdsController = async (req, res) => {
  const sds = await sdsModel.findById(req.params.id);
  if (!sds) return notFound(res, 'SDS document not found');
  await sdsModel.softDelete(req.params.id);
  return success(res, null, 'SDS document deleted');
};

module.exports = deleteSdsController;
