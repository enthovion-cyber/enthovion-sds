const sopModel = require('../../models/sopModel');
const { generatePdf, buildSopHtml } = require('../../services/storage/pdfService');
const { notFound } = require('../../utils/responseHelper');

const exportSopController = async (req, res) => {
  const sop = await sopModel.findById(req.params.id);
  if (!sop) return notFound(res, 'SOP not found');

  const html = buildSopHtml(sop.content || sop);
  const pdf = await generatePdf(html);

  const lang = sop.language || 'en';
  const filename = `SOP_${(sop.type || 'procedure')}_${lang}_v${sop.version}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(pdf);
};

module.exports = exportSopController;
