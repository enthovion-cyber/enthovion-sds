const sdsModel = require('../../models/sdsModel');
const sdsVersionModel = require('../../models/sdsVersionModel');
const { handleSdsChanged } = require('../../services/compliance/eventTriggerService');
const { success, notFound } = require('../../utils/responseHelper');

const updateSdsController = async (req, res) => {
  const existing = await sdsModel.findById(req.params.id);
  if (!existing) return notFound(res, 'SDS document not found');

  const updated = await sdsModel.update(req.params.id, {
    ...req.body,
    version: existing.version + 1,
    status: 'draft', // Re-drafts on update — must re-approve
  });

  if (req.body.sections) {
    await sdsVersionModel.create({
      sds_id: existing.id,
      version: updated.version,
      sections: req.body.sections,
      changed_by: req.user.userId,
      change_summary: req.body.changeSummary || 'Manual update',
    });
  }

  const trigger = await handleSdsChanged({
    sdsId: updated.id,
    userId: req.user.userId,
    reason: 'manual_sds_update',
  });

  return success(res, { ...updated, compliance_trigger: trigger }, 'SDS updated');
};

module.exports = updateSdsController;
