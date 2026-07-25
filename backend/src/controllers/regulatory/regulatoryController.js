const {
  classifyHazards,
  validateCompliance,
  JURISDICTION_FRAMEWORKS,
} = require("../../services/compliance/Regulatoryengine");

const {
  getRecentUpdates,
  getSdsReviewStatus,
  REGULATORY_SOURCES,
} = require("../../services/compliance/regulatoryUpdateService");

const sdsModel = require("../../models/sdsModel");
const { success, notFound } = require("../../utils/responseHelper");
const asyncHandler = require("../../utils/asyncHandler");

// 🔬 Classification
exports.classifyController = asyncHandler(async (req, res) => {
  const result = await classifyHazards(req.body);
  return success(res, result, "Hazard classification complete");
});

// 📄 Validate SDS
exports.validateSdsController = asyncHandler(async (req, res) => {
  const sds = await sdsModel.findById(req.params.id);
  if (!sds) return notFound(res, "SDS not found");

  const report = await validateCompliance(
    sds,
    req.query.jurisdiction || "US_OSHA"
  );

  return success(res, report, "Compliance validation complete");
});

// 📊 Updates
exports.getRegulatoryUpdatesController = asyncHandler(async (req, res) => {
  return success(res, {
    updates: getRecentUpdates(),
    sources: REGULATORY_SOURCES,
  });
});

// 🌍 Frameworks
exports.getFrameworksController = asyncHandler(async (req, res) => {
  return success(res, JURISDICTION_FRAMEWORKS);
});

// ⏳ Review Status
exports.getSdsReviewStatusController = asyncHandler(async (req, res) => {
  const sds = await sdsModel.findById(req.params.id);
  if (!sds) return notFound(res, "SDS not found");

  return success(res, getSdsReviewStatus(sds));
});