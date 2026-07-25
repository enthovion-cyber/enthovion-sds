const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { aiLimiter } = require('../middleware/rateLimiter');

const auditSdsController      = require('../controllers/compliance/auditSdsController');
const auditLibraryController  = require('../controllers/compliance/auditLibraryController');
const getAuditReportController = require('../controllers/compliance/getAuditReportController');
const executePipelineController = require('../controllers/compliance/executePipelineController');
const {
  getContinuousStatusController,
  getGlobalContinuousSnapshotController,
  previewAutoFixController,
} = require('../controllers/compliance/continuousComplianceController');
const {
  startAutoFixWorkflowController,
  getWorkflowTaskController,
  listWorkflowTasksController,
  approveWorkflowTaskController,
  rejectWorkflowTaskController,
  requeueWorkflowTaskController,
} = require('../controllers/compliance/workflowController');
const {
  createMixtureController,
  getAllMixturesController,
  getMixtureByIdController,
  updateMixtureController,
  deleteMixtureController,
  calculateHazardsController,
  autoFillComponentController,
  simulateMixtureController,
  optimizeMixtureController,
} = require('../controllers/mixtures/mixturesController');

router.post('/audit/:id',       aiLimiter, asyncHandler(auditSdsController));
router.post('/audit-library',   aiLimiter, asyncHandler(auditLibraryController));
router.get('/report/:sdsId',    asyncHandler(getAuditReportController));
router.post('/pipeline/execute', aiLimiter, asyncHandler(executePipelineController));
router.get('/continuous/status', asyncHandler(getContinuousStatusController));
router.get('/continuous/global-snapshot', asyncHandler(getGlobalContinuousSnapshotController));
router.get('/auto-fix-preview/:id', asyncHandler(previewAutoFixController));
router.post('/workflow/auto-fix/:id', aiLimiter, asyncHandler(startAutoFixWorkflowController));
router.get('/workflow/tasks', asyncHandler(listWorkflowTasksController));
router.get('/workflow/tasks/:taskId', asyncHandler(getWorkflowTaskController));
router.post('/workflow/tasks/:taskId/approve', asyncHandler(approveWorkflowTaskController));
router.post('/workflow/tasks/:taskId/reject', asyncHandler(rejectWorkflowTaskController));
router.post('/workflow/tasks/:taskId/requeue', asyncHandler(requeueWorkflowTaskController));
router.post('/mixtures', asyncHandler(createMixtureController));
router.get('/mixtures', asyncHandler(getAllMixturesController));
router.get('/mixtures/:id', asyncHandler(getMixtureByIdController));
router.put('/mixtures/:id', asyncHandler(updateMixtureController));
router.delete('/mixtures/:id', asyncHandler(deleteMixtureController));
router.post('/mixtures/:id/calculate', aiLimiter, asyncHandler(calculateHazardsController));
router.post('/mixtures/:id/simulate', aiLimiter, asyncHandler(simulateMixtureController));
router.post('/mixtures/:id/optimize', aiLimiter, asyncHandler(optimizeMixtureController));
router.post('/mixtures/auto-fill-component', aiLimiter, asyncHandler(autoFillComponentController));

module.exports = router;
