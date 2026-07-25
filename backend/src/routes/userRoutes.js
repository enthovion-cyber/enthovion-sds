const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');

const getProfileController    = require('../controllers/user/getProfileController');
const updateProfileController = require('../controllers/user/updateProfileController');
const getNotificationsController = require('../controllers/user/getNotificationsController');
const markNotificationReadController = require('../controllers/user/markNotificationReadController');
const getUnreadNotificationsCountController = require('../controllers/user/getUnreadNotificationsCountController');

const getDashboardStatsController = require('../controllers/library/getDashboardStatsController');
const getExpiringController       = require('../controllers/library/getExpiringController');

router.get('/profile',          asyncHandler(getProfileController));
router.put('/profile',          asyncHandler(updateProfileController));
router.get('/dashboard-stats',  asyncHandler(getDashboardStatsController));
router.get('/expiring-sds',     asyncHandler(getExpiringController));
router.get('/notifications',    asyncHandler(getNotificationsController));
router.get('/notifications/unread-count', asyncHandler(getUnreadNotificationsCountController));
router.post('/notifications/:id/read', asyncHandler(markNotificationReadController));

module.exports = router;
