const express = require("express");
const router = express.Router();

const {
  classifyController,
  validateSdsController,
  getRegulatoryUpdatesController,
  getFrameworksController,
  getSdsReviewStatusController,
} = require("../controllers/regulatory/regulatoryController");

const { authenticate } = require("../middleware/authMiddleware");
const { globalLimiter, aiLimiter } = require("../middleware/rateLimiter");

// 🔬 Classification (AI heavy)
router.post(
  "/classify",
  authenticate,
  aiLimiter,
  classifyController
);

// 📄 Validate SDS
router.get(
  "/validate/:id",
  authenticate,
  globalLimiter,
  validateSdsController
);

// 📊 Updates
router.get(
  "/updates",
  authenticate,
  globalLimiter,
  getRegulatoryUpdatesController
);

// 🌍 Frameworks
router.get(
  "/frameworks",
  authenticate,
  globalLimiter,
  getFrameworksController
);

// ⏳ Review Status
router.get(
  "/review-status/:id",
  authenticate,
  globalLimiter,
  getSdsReviewStatusController
);

module.exports = router;