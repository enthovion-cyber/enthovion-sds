const sdsModel = require("../../models/sdsModel");
const {
  runContinuousScanForUser,
  getLastGlobalScanSnapshot,
  evaluateSingleSds,
} = require("../../services/compliance/continuousComplianceService");
const { success, notFound } = require("../../utils/responseHelper");

const getContinuousStatusController = async (req, res) => {
  const report = await runContinuousScanForUser(req.user.userId);
  return success(res, report, "Continuous compliance report");
};

const getGlobalContinuousSnapshotController = async (req, res) => {
  const snapshot = getLastGlobalScanSnapshot();
  return success(
    res,
    snapshot || { status: "not_ready", message: "Global scan has not run yet" },
    "Continuous global snapshot"
  );
};

const previewAutoFixController = async (req, res) => {
  const sds = await sdsModel.findById(req.params.id);
  if (!sds) return notFound(res, "SDS not found");
  const evaluated = evaluateSingleSds(sds);
  return success(
    res,
    {
      sds_id: sds.id,
      chemical_name: sds.chemical_name,
      auto_fix_suggestions: evaluated.auto_fix_suggestions,
      conflicts: evaluated.conflicts,
      status: evaluated.status,
    },
    "Auto-fix preview generated"
  );
};

module.exports = {
  getContinuousStatusController,
  getGlobalContinuousSnapshotController,
  previewAutoFixController,
};
