const sdsModel = require("../../models/sdsModel");
const validationModel = require("../../models/validationModel");
const {
  scoreDocument,
  aiDeepValidate,
} = require("../../services/validation/aiValidationService");
const {
  detectConflicts,
} = require("../../services/compliance/Regulatoryengine");
const asyncHandler = require("../../utils/asyncHandler");
const { success, notFound } = require("../../utils/responseHelper");

exports.validateController = asyncHandler(async (req, res) => {
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  const result = scoreDocument(sds);
  await validationModel.create({
    sds_id: sds.id,
    user_id: req.user.userId,
    overall_score: result.overall_score,
    status: result.status,
    missing_items: result.missing_items,
    conflicts: result.conflicts,
    section_scores: result.section_scores,
    validated_at: result.validated_at,
  });
  return success(res, result, "Validation complete");
});
exports.deepValidateController = asyncHandler(async (req, res) => {
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  const result = await aiDeepValidate(sds);
  await validationModel.create({
    sds_id: sds.id,
    user_id: req.user.userId,
    overall_score: result.overall_score,
    status: result.status,
    missing_items: result.missing_items,
    conflicts: result.conflicts,
    section_scores: result.section_scores,
    validated_at: result.validated_at,
  });
  return success(res, result, "Deep AI validation complete");
});
exports.getConflictsController = asyncHandler(async (req, res) => {
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  const conflicts = detectConflicts(sds);
  return success(res, {
    conflicts,
    count: conflicts.length,
    has_critical: conflicts.some((c) => c.severity === "critical"),
  });
});
exports.getLatestValidationController = asyncHandler(async (req, res) => {
  const r = await validationModel.findLatestBySdsId(req.params.sdsId);
  if (!r) return notFound(res, "No validation run yet");
  return success(res, r);
});
exports.getAllValidationsController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, total } = await validationModel.findAll(req.user.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return success(res, data, "Validations", 200, { total });
});
