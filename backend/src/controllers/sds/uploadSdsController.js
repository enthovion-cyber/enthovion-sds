const sdsModel = require('../../models/sdsModel');
const { extractFromPdf } = require('../../services/ai/extractionService');
const { uploadFile } = require('../../services/storage/supabaseStorageService');
const { buildSdsIntelligenceModel } = require('../../services/compliance/sdsIntelligenceService');
const { created, badRequest } = require('../../utils/responseHelper');
const env = require('../../config/env');

const uploadSdsController = async (req, res) => {
  if (!req.file) return badRequest(res, 'No file uploaded');

  // Upload raw file to Supabase Storage
  const stored = await uploadFile(
  req.file.buffer,
  req.file.originalname,
  env.storage.bucketSds, // Match this to your env.js key
  `${req.user.userId}/uploads`
);

  // Extract SDS sections using AI
  const extracted = await extractFromPdf(req.file.buffer, req.file.originalname);
  const intelligenceModel = buildSdsIntelligenceModel({
    extracted,
    sourceFilePath: stored.path,
  });

  // Save to DB as draft
  const saved = await sdsModel.create({
    user_id: req.user.userId,
    chemical_name: extracted.chemical_name || 'Unknown - Please update',
    cas_number: extracted.cas_number,
    language: extracted.detected_language || 'en',
    jurisdiction: extracted.detected_jurisdiction || 'US_OSHA',
    sections: {
      ...extracted.sections,
      intelligence_model: intelligenceModel,
    },
    status: 'draft',
    source_file: stored.path,
    extraction_confidence: extracted.extraction_confidence,
  });

  return created(res, {
    sds: saved,
    intelligenceModel,
    extractionConfidence: extracted.extraction_confidence,
    fieldsRequiringReview: extracted.fields_requiring_review || [],
  }, 'SDS Intelligence Engine completed extraction and structured mapping. Please review before publishing.');
};

module.exports = uploadSdsController;
