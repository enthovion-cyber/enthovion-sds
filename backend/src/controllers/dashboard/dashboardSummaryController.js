const { success } = require('../../utils/responseHelper');
const { getDashboardSummary } = require('../../services/dashboard/dashboardSummaryService');

const allowedFilters = [
  'from',
  'to',
  'company_id',
  'site_id',
  'unit_id',
  'area_id',
  'jurisdiction',
  'status',
  'product_family',
  'owner_id',
  'language',
  'range',
];

const dashboardSummaryController = async (req, res) => {
  const filters = allowedFilters.reduce((acc, key) => {
    if (typeof req.query[key] === 'string' && req.query[key].trim()) {
      acc[key] = req.query[key].trim();
    }
    return acc;
  }, {});

  const summary = await getDashboardSummary({ user: req.user, filters });
  return success(res, summary);
};

module.exports = dashboardSummaryController;
