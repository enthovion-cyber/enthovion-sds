const mixturesModel = require("../../models/mixturesModel");
const {
  calculateMixtureHazards,
  autoFillComponent,
  runWhatIfSimulation,
  optimizeMixture,
} = require("../../services/ai/mixtureCalculationService");
const { handleMixtureChanged } = require("../../services/compliance/eventTriggerService");
const asyncHandler = require("../../utils/asyncHandler");
const {
  success,
  created,
  notFound,
  paginated,
} = require("../../utils/responseHelper");

exports.createMixtureController = asyncHandler(async (req, res) => {
  return created(
    res,
    await mixturesModel.create({ ...req.body, user_id: req.user.userId }),
    "Mixture created",
  );
});
exports.getAllMixturesController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, total } = await mixturesModel.findAll(req.user.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return paginated(res, data, total, page, limit);
});
exports.getMixtureByIdController = asyncHandler(async (req, res) => {
  const m = await mixturesModel.findById(req.params.id);
  if (!m) return notFound(res, "Mixture not found");
  return success(res, m);
});
exports.updateMixtureController = asyncHandler(async (req, res) => {
  const m = await mixturesModel.findById(req.params.id);
  if (!m) return notFound(res, "Mixture not found");
  const updated = await mixturesModel.update(req.params.id, req.body);
  const trigger = await handleMixtureChanged({
    linkedSdsId: req.body?.linked_sds_id || updated?.linked_sds_id,
    userId: req.user.userId,
    reason: "mixture_update",
  });
  return success(
    res,
    { ...updated, compliance_trigger: trigger },
    "Mixture updated",
  );
});
exports.deleteMixtureController = asyncHandler(async (req, res) => {
  await mixturesModel.remove(req.params.id);
  return success(res, null, "Mixture deleted");
});
exports.calculateHazardsController = asyncHandler(async (req, res) => {
  const m = await mixturesModel.findById(req.params.id);
  if (!m) return notFound(res, "Mixture not found");
  const result = await calculateMixtureHazards({
    name: m.name,
    components: m.components || [],
    jurisdiction: m.jurisdiction || "US_OSHA",
  });
  await mixturesModel.update(req.params.id, {
    hazard_calculation: result,
    last_calculated_at: new Date().toISOString(),
  });
  const trigger = await handleMixtureChanged({
    linkedSdsId: m.linked_sds_id,
    userId: req.user.userId,
    reason: "mixture_recalculated",
  });
  return success(res, { ...result, compliance_trigger: trigger }, "Mixture hazard calculation complete");
});

exports.autoFillComponentController = asyncHandler(async (req, res) => {
  const { cas_number, chemical_name } = req.body || {};
  const filled = await autoFillComponent({ cas_number, chemical_name });
  return success(res, filled, "Component intelligence loaded");
});

exports.simulateMixtureController = asyncHandler(async (req, res) => {
  const m = await mixturesModel.findById(req.params.id);
  if (!m) return notFound(res, "Mixture not found");
  const { componentId, concentrationPercent } = req.body || {};
  const simulation = await runWhatIfSimulation({
    mixture: m,
    componentId,
    concentrationPercent,
  });
  return success(res, simulation, "What-if simulation complete");
});

exports.optimizeMixtureController = asyncHandler(async (req, res) => {
  const m = await mixturesModel.findById(req.params.id);
  if (!m) return notFound(res, "Mixture not found");
  const optimized = await optimizeMixture({
    mixture: m,
    goal: req.body?.goal || "Reduce hazard",
  });
  return success(res, optimized, "Optimization suggestions generated");
});
