const sdsModel = require('../../models/sdsModel');
const sdsVersionModel = require('../../models/sdsVersionModel');
const { success, notFound } = require('../../utils/responseHelper');

const getSdsByIdController = async (req, res) => {
  const sds = await sdsModel.findById(req.params.id);
  if (!sds) return notFound(res, 'SDS document not found');

  const versions = await sdsVersionModel.findBySdsId(sds.id);
  return success(res, { ...sds, versions });
};

module.exports = getSdsByIdController;
