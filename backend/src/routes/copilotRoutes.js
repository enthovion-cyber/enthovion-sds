"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const copilotController = require("../controllers/copilot/copilotController");

// Destructure the controllers for cleaner readability
const {
  copilotMessageController,
  autoFixController,
  safetySummaryController,
  casAutoFillController,
  simulateController,
  optimizeController,
  explainController
} = copilotController;

// Routes
router.post("/message", asyncHandler(copilotMessageController));
router.post("/auto-fix", asyncHandler(autoFixController));
router.get("/summary/:sdsId", asyncHandler(safetySummaryController));
router.get("/cas/:cas", asyncHandler(casAutoFillController));
router.post("/simulate", asyncHandler(simulateController));
router.post("/optimize", asyncHandler(optimizeController));
router.post("/explain", asyncHandler(explainController));

module.exports = router;