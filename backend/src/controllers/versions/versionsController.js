const sdsModel = require("../../models/sdsModel");
const sdsVersionModel = require("../../models/sdsVersionModel");
const {
  computeSectionDiff,
  generateChangeSummary,
  generateAuditReport,
} = require("../../services/ai/versionService");
const { generatePdf } = require("../../services/storage/pdfService");
const { success, notFound, badRequest } = require("../../utils/responseHelper");
const asyncHandler = require("../../utils/asyncHandler");

exports.getVersionHistoryController = asyncHandler(async (req, res) => {
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  const versions = await sdsVersionModel.findBySdsId(req.params.sdsId);
  return success(res, {
    sds: {
      id: sds.id,
      chemical_name: sds.chemical_name,
      current_version: sds.version,
    },
    versions,
  });
});
exports.compareVersionsController = asyncHandler(async (req, res) => {
  const { v1, v2 } = req.query;
  if (!v1 || !v2) return badRequest(res, "Provide v1 and v2 query parameters");
  const [ver1, ver2] = await Promise.all([
    sdsVersionModel.findByVersion(req.params.sdsId, parseInt(v1)),
    sdsVersionModel.findByVersion(req.params.sdsId, parseInt(v2)),
  ]);
  if (!ver1 || !ver2) return notFound(res, "One or both versions not found");
  const changes = computeSectionDiff(ver1.sections, ver2.sections);
  return success(res, {
    from_version: parseInt(v1),
    to_version: parseInt(v2),
    changes,
    change_count: changes.length,
    summary: generateChangeSummary(changes),
    sections_affected: [...new Set(changes.map((c) => c.section))],
  });
});
exports.rollbackController = asyncHandler(async (req, res) => {
  const { version } = req.body;
  if (!version) return badRequest(res, "Provide target version number");
  const target = await sdsVersionModel.findByVersion(
    req.params.sdsId,
    parseInt(version),
  );
  if (!target) return notFound(res, `Version ${version} not found`);
  const current = await sdsModel.findById(req.params.sdsId);
  if (!current) return notFound(res, "SDS not found");
  await sdsVersionModel.create({
    sds_id: current.id,
    version: current.version + 1,
    sections: current.sections,
    changed_by: req.user.userId,
    change_summary: `Pre-rollback snapshot (rolling back to v${version})`,
  });
  const updated = await sdsModel.update(req.params.sdsId, {
    sections: target.sections,
    version: current.version + 1,
    status: "draft",
  });
  await sdsVersionModel.create({
    sds_id: current.id,
    version: updated.version,
    sections: target.sections,
    changed_by: req.user.userId,
    change_summary: `Rolled back to version ${version}`,
  });
  return success(res, updated, `Rolled back to version ${version}`);
});
exports.exportAuditTrailController = asyncHandler(async (req, res) => {
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  const versions = await sdsVersionModel.findBySdsId(req.params.sdsId);
  const audit = generateAuditReport(sds, versions);
  if (req.query.format === "pdf") {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial;padding:20mm}h1{font-size:16pt;border-bottom:2px solid #000;padding-bottom:4mm}table{width:100%;border-collapse:collapse;font-size:10pt}th,td{border:1px solid #ccc;padding:3mm}th{background:#f5f5f5}</style></head><body><h1>${audit.report_title}</h1><p><strong>Chemical:</strong> ${audit.chemical_name} | CAS: ${audit.cas_number || "N/A"} | Version: ${audit.current_version}</p><p><strong>Generated:</strong> ${new Date(audit.generated_at).toLocaleString()}</p><table><tr><th>Version</th><th>Date</th><th>Author</th><th>Changes</th></tr>${audit.version_history.map((v) => `<tr><td>v${v.version}</td><td>${new Date(v.created_at).toLocaleString()}</td><td>${v.changed_by}</td><td>${v.change_summary}</td></tr>`).join("")}</table><p style="font-size:8pt;margin-top:10mm">${audit.compliance_note}</p></body></html>`;
    const pdf = await generatePdf(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="audit_${sds.chemical_name.replace(/\s/g, "_")}.pdf"`,
    );
    return res.send(pdf);
  }
  return success(res, audit);
});
