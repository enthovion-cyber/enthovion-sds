const sdsModel = require("../../models/sdsModel");
const labelsModel = require("../../models/labelsModel");
const {
  generateLabelHtml,
  LABEL_SIZES,
  extractLabelData,
} = require("../../services/ai/labelGeneratorService");
const { generatePdf } = require("../../services/storage/pdfService");
const asyncHandler = require("../../utils/asyncHandler");
const {
  success,
  notFound,
  created,
  badRequest,
} = require("../../utils/responseHelper");

exports.generateLabelController = asyncHandler(async (req, res) => {
  const { size = "medium", language } = req.body;
  if (!LABEL_SIZES[size])
    return badRequest(
      res,
      `Invalid size. Choose: ${Object.keys(LABEL_SIZES).join(", ")}`,
    );
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  const lang = language || sds.language || "en";
  const html = generateLabelHtml(sds, size, lang);
  const labelData = extractLabelData(sds);
  const saved = await labelsModel.create({
    sds_id: sds.id,
    user_id: req.user.userId,
    size,
    language: lang,
    label_data: labelData,
  });
  return created(
    res,
    {
      label_id: saved.id,
      sds_id: sds.id,
      size,
      size_label: LABEL_SIZES[size].name,
      language: lang,
      label_data: labelData,
      html_preview: html,
    },
    "Label generated",
  );
});
exports.previewLabelController = asyncHandler(async (req, res) => {
  const { size = "medium", language } = req.query;
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  res.setHeader("Content-Type", "text/html");
  return res.send(
    generateLabelHtml(sds, size, language || sds.language || "en"),
  );
});
exports.exportLabelPdfController = asyncHandler(async (req, res) => {
  const { size = "medium", language, copies = 1 } = req.query;
  const sds = await sdsModel.findById(req.params.sdsId);
  if (!sds) return notFound(res, "SDS not found");
  const html = generateLabelHtml(sds, size, language || sds.language || "en");
  const pdf = await generatePdf(html);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="label_${sds.chemical_name.replace(/\s+/g, "_")}_${size}.pdf"`,
  );
  return res.send(pdf);
});
exports.getLabelsBySdsController = asyncHandler(async (req, res) => {
  return success(res, await labelsModel.findBySdsId(req.params.sdsId));
});
exports.getAllLabelsController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, total } = await labelsModel.findAll(req.user.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return success(res, data, "Labels", 200, { total });
});
exports.getLabelSizesController = asyncHandler(async (req, res) =>
  success(res, LABEL_SIZES),
);

