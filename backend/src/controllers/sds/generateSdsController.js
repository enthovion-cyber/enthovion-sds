const sdsModel = require('../../models/sdsModel');
const sdsVersionModel = require('../../models/sdsVersionModel');
const { generateSds } = require('../../services/ai/sdsGeneratorService');
const { success, created, notFound, serverError } = require('../../utils/responseHelper');

const generateSdsController = async (req, res) => {
  const params = req.body;
  const sdsData = await generateSds(params);

  const saved = await sdsModel.create({
    user_id: req.user.userId,
    chemical_name: sdsData.chemical_name,
    cas_number: sdsData.cas_number,
    formula: sdsData.formula,
    language: sdsData.language || 'en',
    jurisdiction: sdsData.jurisdiction || 'US_OSHA',
    sections: sdsData.sections,
    status: 'draft',
    ai_model: sdsData.ai_model,
    tokens_used: sdsData.tokens_used,
    expires_at: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Save initial version
  await sdsVersionModel.create({
    sds_id: saved.id,
    version: 1,
    sections: sdsData.sections,
    changed_by: req.user.userId,
    change_summary: 'Initial AI generation',
  });

  return created(res, saved, 'SDS generated successfully');
};

module.exports = generateSdsController;
