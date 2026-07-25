const sopModel = require('../../models/sopModel');
const { success, notFound } = require('../../utils/responseHelper');

const updateSopController = async (req, res) => {
  const sop = await sopModel.findById(req.params.id);
  if (!sop) return notFound(res, 'SOP not found');

  const updated = await sopModel.update(req.params.id, {
    ...req.body,
    version: (sop.version || 1) + 1,
    status: 'draft',
  });

  return success(res, updated, 'SOP updated');
};

module.exports = updateSopController;
