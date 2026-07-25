const complianceModel = require('../../models/complianceModel');
const { success, notFound } = require('../../utils/responseHelper');

const getAuditReportController = async (req, res) => {
  const { sdsId } = req.params;
  const { jurisdiction } = req.query;

  // findLatestBySdsId now uses .maybeSingle(), so it won't throw on 404
  const report = await complianceModel.findLatestBySdsId(sdsId, jurisdiction);
  
  if (!report) {
    return notFound(res, 'No audit report exists for this SDS/Jurisdiction');
  }

  return success(res, report);
};

module.exports = getAuditReportController;