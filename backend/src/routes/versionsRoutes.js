const express = require('express');
const router = express.Router();

const controller = require('../controllers/versions/versionsController');
const validate = require('../middleware/validateRequest');
const {
  validateSdsId,
  validateCompare,
  validateRollback,
} = require('../middleware/versionValidation');

// GET version history
router.get(
  '/:sdsId/versions',
  validateSdsId,
  validate,
  controller.getVersionHistoryController
);

// COMPARE versions
router.get(
  '/:sdsId/versions/compare',
  validateSdsId,
  validateCompare,
  validate,
  controller.compareVersionsController
);

// ROLLBACK
router.post(
  '/:sdsId/versions/rollback',
  validateSdsId,
  validateRollback,
  validate,
  controller.rollbackController
);

// EXPORT audit
router.get(
  '/:sdsId/versions/audit',
  validateSdsId,
  validate,
  controller.exportAuditTrailController
);

module.exports = router;