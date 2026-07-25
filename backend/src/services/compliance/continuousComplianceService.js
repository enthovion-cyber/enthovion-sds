const sdsModel = require("../../models/sdsModel");
const { supabaseAdmin } = require("../../config/database");
const {
  scoreDocument,
} = require("../validation/aiValidationService");
const { detectConflicts } = require("./regulatoryEngine");
const {
  getRecentUpdates,
  getSdsReviewStatus,
  detectUpdateImpact,
} = require("./regulatoryUpdateService");

let lastGlobalScanSnapshot = null;

const buildAutoFixSuggestions = (sdsDoc, validation, conflicts, regulatoryImpact) => {
  const suggestions = [];
  const missing = validation.missing_items || [];

  missing.slice(0, 6).forEach((item) => {
    suggestions.push({
      type: "missing_field",
      section: item.section,
      severity: item.severity,
      suggestion: `Populate ${item.field || "required field"} in ${item.section} to improve compliance score.`,
      action: "auto-fill-from-intelligence",
    });
  });

  conflicts.slice(0, 4).forEach((conflict) => {
    suggestions.push({
      type: "conflict_resolution",
      severity: conflict.severity,
      suggestion: conflict.fix || conflict.description,
      action: "repair-cross-section-consistency",
    });
  });

  (regulatoryImpact.impacts || []).slice(0, 3).forEach((impact) => {
    suggestions.push({
      type: "regulatory_update",
      severity: impact.severity,
      suggestion: impact.action_required,
      action: "update-regulatory-sections",
    });
  });

  return suggestions;
};

const classifyStatus = ({ score, criticalCount, hasRegulatoryImpact }) => {
  if (criticalCount > 0 || score < 60) return "violations";
  if (hasRegulatoryImpact || score < 85) return "risk";
  return "compliant";
};

const evaluateSingleSds = (sdsDoc, updates = getRecentUpdates()) => {
  const validation = scoreDocument(sdsDoc);
  const conflicts = detectConflicts(sdsDoc);
  const review = getSdsReviewStatus(sdsDoc);
  const regulatoryImpact = detectUpdateImpact(sdsDoc, updates);
  const criticalCount =
    (validation.critical_count || 0) +
    conflicts.filter((c) => c.severity === "critical").length;
  const status = classifyStatus({
    score: validation.overall_score || 0,
    criticalCount,
    hasRegulatoryImpact: regulatoryImpact.has_impact,
  });
  const autoFixSuggestions = buildAutoFixSuggestions(
    sdsDoc,
    validation,
    conflicts,
    regulatoryImpact
  );

  return {
    sds_id: sdsDoc.id,
    chemical_name: sdsDoc.chemical_name,
    jurisdiction: sdsDoc.jurisdiction,
    status,
    score: validation.overall_score,
    review_status: review.status,
    regulatory_impact: regulatoryImpact,
    conflicts,
    auto_fix_suggestions: autoFixSuggestions,
    checked_at: new Date().toISOString(),
  };
};

const summarize = (items) => ({
  total: items.length,
  compliant: items.filter((i) => i.status === "compliant").length,
  risk: items.filter((i) => i.status === "risk").length,
  violations: items.filter((i) => i.status === "violations").length,
});

const runContinuousScanForUser = async (userId) => {
  const { data } = await sdsModel.findAll({
    userId,
    page: 1,
    limit: 500,
  });
  const updates = getRecentUpdates();
  const items = (data || []).map((sdsDoc) => evaluateSingleSds(sdsDoc, updates));
  return {
    summary: summarize(items),
    updates_checked: updates.length,
    items,
    scanned_at: new Date().toISOString(),
  };
};

const runContinuousScanGlobal = async () => {
  const { data, error } = await supabaseAdmin
    .from("sds_documents")
    .select("id,user_id,chemical_name,cas_number,jurisdiction,language,sections,status,updated_at,created_at,expires_at")
    .is("deleted_at", null)
    .limit(2000);

  if (error) throw error;

  const updates = getRecentUpdates();
  const items = (data || []).map((sdsDoc) => evaluateSingleSds(sdsDoc, updates));
  lastGlobalScanSnapshot = {
    summary: summarize(items),
    updates_checked: updates.length,
    scanned_at: new Date().toISOString(),
  };
  return lastGlobalScanSnapshot;
};

const getLastGlobalScanSnapshot = () => lastGlobalScanSnapshot;

module.exports = {
  runContinuousScanForUser,
  runContinuousScanGlobal,
  getLastGlobalScanSnapshot,
  evaluateSingleSds,
};
