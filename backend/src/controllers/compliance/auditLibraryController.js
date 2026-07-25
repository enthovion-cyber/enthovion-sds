const sdsModel = require('../../models/sdsModel');
const complianceModel = require('../../models/complianceModel');
const { auditSds } = require('../../services/ai/complianceAuditService');
const { success } = require('../../utils/responseHelper');

// Audit all approved SDS docs in the library (queued, returns job summary)
const auditLibraryController = async (req, res) => {
  const { jurisdiction = 'US_OSHA' } = req.query;

  const { data: allSds } = await sdsModel.findAll({
    userId: req.user.userId,
    page: 1,
    limit: 100,
    status: 'approved',
  });

  if (!allSds.length) {
    return success(res, { audited: 0 }, 'No approved SDS documents to audit');
  }

  // Run audits sequentially to avoid rate limits
  const results = [];
  for (const sds of allSds.slice(0, 20)) { // Cap at 20 per request
    try {
      const fullSds = await sdsModel.findById(sds.id);
      const report = await auditSds(fullSds, jurisdiction);
      await complianceModel.create({
        sds_id: sds.id,
        jurisdiction,
        score: report.score,
        gaps: report.gaps,
        run_by: req.user.userId,
      });
      await sdsModel.updateComplianceScore(sds.id, report.score);
      results.push({ sdsId: sds.id, name: sds.chemical_name, score: report.score });
    } catch (e) {
      results.push({ sdsId: sds.id, name: sds.chemical_name, error: e.message });
    }
  }

  const avgScore = Math.round(results.filter(r => r.score).reduce((s, r) => s + r.score, 0) / results.filter(r => r.score).length) || 0;

  return success(res, { audited: results.length, results, averageScore: avgScore }, 'Library audit complete');
};

module.exports = auditLibraryController;
