// routes/labelRoutes.js

const express = require("express");
const router = express.Router();

const controller = require("../controllers/labels/labelsController");
const {
  validateSdsId,
  validateGenerateLabel,
  validateLabelQuery,
} = require("../middleware/labelValidation");

// 🔹 Generate label
router.post(
  "/:sdsId/generate",
  validateSdsId,
  validateGenerateLabel,
  controller.generateLabelController
);

// 🔹 Preview HTML
router.get(
  "/:sdsId/preview",
  validateSdsId,
  validateLabelQuery,
  controller.previewLabelController
);

// 🔹 Export PDF
router.get(
  "/:sdsId/export",
  validateSdsId,
  validateLabelQuery,
  controller.exportLabelPdfController
);

// 🔹 Get labels for SDS
router.get(
  "/:sdsId",
  validateSdsId,
  controller.getLabelsBySdsController
);

// 🔹 Get all labels
router.get("/", controller.getAllLabelsController);

// 🔹 Get sizes
router.get("/sizes", controller.getLabelSizesController);

module.exports = router;