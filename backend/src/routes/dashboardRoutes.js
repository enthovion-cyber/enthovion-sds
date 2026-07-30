const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const dashboardSummaryController = require('../controllers/dashboard/dashboardSummaryController');

router.get('/summary', asyncHandler(dashboardSummaryController));

module.exports = router;
