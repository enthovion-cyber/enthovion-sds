"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { handleSdsUpload } = require("../middleware/uploadMiddleware");
const pipelineController = require("../controllers/pipeline/pipelineController");

// Destructure the controllers
const { uploadPipelineController, generatePipelineController } = pipelineController;

// Routes
router.post("/upload", handleSdsUpload, asyncHandler(uploadPipelineController));
router.post("/generate", asyncHandler(generatePipelineController));

module.exports = router;