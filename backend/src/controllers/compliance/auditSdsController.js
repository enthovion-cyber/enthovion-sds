const sdsModel = require('../../models/sdsModel');
const complianceModel = require('../../models/complianceModel');
const { auditSds } = require('../../services/ai/complianceAuditService');
const { success, notFound } = require('../../utils/responseHelper');

const auditSdsController = async (req, res) => {
  const { jurisdiction = 'US_OSHA' } = req.query;
  const { id } = req.params;

  try {
    // Find SDS
    const sds = await sdsModel.findById(id);

    if (!sds) {
      return notFound(res, 'SDS document not found');
    }

    // Run AI audit
    const report = await auditSds(sds, jurisdiction);

    console.dir(report, { depth: null });

    if (report.failed) {
      return res.status(502).json({
        success: false,
        message: 'Compliance audit failed',
        error: report.error || report.summary,
      });
    }

    // Save report
    const saved = await complianceModel.create({
      sds_id: id,
      jurisdiction,
      score: report.score,
      score_breakdown: report.score_breakdown || null,
      status: report.status || null,
      summary: report.summary || null,
      standard: report.standard || null,
      gaps: report.gaps || [],
      section_checks: report.section_checks || null,
      passed_checks: report.passed_checks || [],
      recommendations: report.recommendations || [],
      audited_at: report.audited_at,
      run_by: req.user?.userId || null,
    });

    // Update SDS score
    try {
      await sdsModel.updateComplianceScore(id, report.score);
    } catch (err) {
      console.error('updateComplianceScore failed:', err);
    }

    return success(
      res,
      {
        ...report,
        auditId: saved?.id,
      },
      'Compliance audit completed'
    );
  } catch (error) {
    console.error('Single Audit Controller Error:');
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: 'Audit processing failed',
      error: error.message,
    });
  }
};

module.exports = auditSdsController;