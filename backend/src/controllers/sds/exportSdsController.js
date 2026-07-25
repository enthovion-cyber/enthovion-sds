const sdsModel = require('../../models/sdsModel');
const { generatePdf, buildSdsHtml } = require('../../services/storage/pdfService');
const { notFound } = require('../../utils/responseHelper');

const exportSdsController = async (req, res) => {
  const sds = await sdsModel.findById(req.params.id);
  if (!sds) return notFound(res, 'SDS document not found');

  const html = buildSdsHtml(sds);
  const pdf = await generatePdf(html);

  const filename = `SDS_${(sds.chemical_name || 'document').replace(/\s+/g, '_')}_v${sds.version}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(pdf);
};

module.exports = exportSdsController;
