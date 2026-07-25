const sdsModel = require('../../models/sdsModel');
const { handleSdsChanged } = require('../../services/compliance/eventTriggerService');
const { success, notFound, forbidden } = require('../../utils/responseHelper');

const approveSdsController = async (req, res) => {
  const sds = await sdsModel.findById(req.params.id);
  if (!sds) return notFound(res, 'SDS document not found');

  if (!['ehs_manager', 'admin'].includes(req.user.role)) {
    return forbidden(res, 'Only EHS Managers and Admins can approve SDS documents');
  }

  const updated = await sdsModel.update(req.params.id, {
    status: 'approved',
    approved_by: req.user.userId,
    approved_at: new Date().toISOString(),
  });

  const trigger = await handleSdsChanged({
    sdsId: updated.id,
    userId: req.user.userId,
    reason: 'sds_approved',
  });

  return success(res, { ...updated, compliance_trigger: trigger }, 'SDS document approved and published');
};

module.exports = approveSdsController;
