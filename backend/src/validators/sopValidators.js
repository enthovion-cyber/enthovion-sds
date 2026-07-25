const Joi = require('joi');

const generateSopSchema = Joi.object({
  sdsId: Joi.string().uuid().required(),
  language: Joi.string()
    .valid('en', 'ar', 'fr', 'de', 'es', 'pt', 'zh', 'ja', 'ko', 'hi', 'ur', 'id', 'tr', 'ru', 'it', 'nl')
    .default('en'),
  type: Joi.string()
    .valid('handling', 'emergency', 'spill', 'disposal', 'storage')
    .default('handling'),
  includeVoiceover: Joi.boolean().default(false),
});

const updateSopSchema = Joi.object({
  content: Joi.object().optional(),
  status: Joi.string().valid('draft', 'approved').optional(),
});

module.exports = { generateSopSchema, updateSopSchema };
