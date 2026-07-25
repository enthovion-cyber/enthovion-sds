const express = require("express");
const router = express.Router();

const {
  validateController,
  deepValidateController,
  getConflictsController,
  getLatestValidationController,
  getAllValidationsController,
} = require("../controllers/validation/validationController");

const { authenticate } = require("../middleware/authMiddleware");

// Run quick validation score
router.post("/score/:sdsId", authenticate, validateController);

// Run deep AI validation
router.post("/deep/:sdsId", authenticate, deepValidateController);

// Get conflicts only
router.get("/conflicts/:sdsId", authenticate, getConflictsController);

// Get latest validation result for SDS
router.get("/latest/:sdsId", authenticate, getLatestValidationController);

// Get all validations for logged-in user
router.get("/", authenticate, getAllValidationsController);

module.exports = router;