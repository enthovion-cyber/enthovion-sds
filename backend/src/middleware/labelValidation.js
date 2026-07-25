// middleware/labelValidation.js

const { badRequest } = require("../utils/responseHelper");
const { LABEL_SIZES } = require("../services/ai/labelGeneratorService");

// 🔹 Validate SDS ID
exports.validateSdsId = (req, res, next) => {
  if (!req.params.sdsId) {
    return badRequest(res, "SDS ID is required");
  }
  next();
};

// 🔹 Validate generate label
exports.validateGenerateLabel = (req, res, next) => {
  const { size, language } = req.body;

  if (size && !LABEL_SIZES[size]) {
    return badRequest(
      res,
      `Invalid size. Allowed: ${Object.keys(LABEL_SIZES).join(", ")}`
    );
  }

  if (language && typeof language !== "string") {
    return badRequest(res, "Invalid language");
  }

  next();
};

// 🔹 Validate preview/export
exports.validateLabelQuery = (req, res, next) => {
  const { size, language, copies } = req.query;

  if (size && !LABEL_SIZES[size]) {
    return badRequest(
      res,
      `Invalid size. Allowed: ${Object.keys(LABEL_SIZES).join(", ")}`
    );
  }

  if (copies && (isNaN(parseInt(copies)) || copies < 1)) {
    return badRequest(res, "Copies must be a positive number");
  }

  if (language && typeof language !== "string") {
    return badRequest(res, "Invalid language");
  }

  next();
};