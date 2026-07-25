"use strict";

const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");

// 1. IMPORT ALL ROUTES (Added the missing copilot and pipeline imports here)
const authRoutes = require("./authRoutes");
const sdsRoutes = require("./sdsRoutes");
const sopRoutes = require("./sopRoutes");
const complianceRoutes = require("./complianceRoutes");
const chatRoutes = require("./chatRoutes");
const userRoutes = require("./userRoutes");
const regulatoryRoutes = require("./regulatoryRoutes");
const versionsRoutes = require("./versionsRoutes");
const validationRoutes = require("./validationRoutes");
const labelsRoutes = require("./labelsRoutes");
const pipelineRoutes = require("./pipelineRoutes"); // <-- Added this
const copilotRoutes = require("./copilotRoutes");   // <-- Added this

// 2. PUBLIC ROUTES
router.use("/auth", authRoutes);

// 3. PROTECTED ROUTES (All require authentication)
router.use("/sds", authenticate, sdsRoutes);
router.use("/sop", authenticate, sopRoutes);
router.use("/compliance", authenticate, complianceRoutes);
router.use("/chat", authenticate, chatRoutes);
router.use("/user", authenticate, userRoutes);
router.use("/regulatory", authenticate, regulatoryRoutes);
router.use("/pipeline", authenticate, pipelineRoutes);
router.use("/copilot", authenticate, copilotRoutes);
router.use("/version", authenticate, versionsRoutes);
router.use("/validation", authenticate, validationRoutes);
router.use("/labels", authenticate, labelsRoutes);

module.exports = router;