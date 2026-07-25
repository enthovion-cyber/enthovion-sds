const sdsModel = require("../../models/sdsModel");
const {
  evaluateSingleSds,
} = require("./continuousComplianceService");
const {
  enqueueAutoFixTask,
} = require("./autoFixWorkflowService");

const handleSdsChanged = async ({ sdsId, userId, reason = "sds_updated" }) => {
  const sds = await sdsModel.findById(sdsId);
  if (!sds) return { triggered: false, reason: "sds_not_found" };

  const evaluation = evaluateSingleSds(sds);
  if (evaluation.status === "violations") {
    const task = await enqueueAutoFixTask({ userId, sdsId });
    return {
      triggered: true,
      reason,
      evaluation_status: evaluation.status,
      task_id: task.id,
    };
  }
  return {
    triggered: false,
    reason,
    evaluation_status: evaluation.status,
  };
};

const handleMixtureChanged = async ({ linkedSdsId, userId, reason = "mixture_updated" }) => {
  if (!linkedSdsId) return { triggered: false, reason: "no_linked_sds" };
  return handleSdsChanged({ sdsId: linkedSdsId, userId, reason });
};

module.exports = {
  handleSdsChanged,
  handleMixtureChanged,
};
