const Joi = require('joi');

const generateSdsSchema = Joi.object({
  chemicalName: Joi.string().min(2).max(500).optional(),
  casNumber: Joi.string()
    .pattern(/^\d{1,7}-\d{2}-\d$/)
    .optional()
    .messages({ 'string.pattern.base': 'CAS number format must be XXXXXXX-XX-X' }),
  formula: Joi.string().max(500).optional(),
  productCode: Joi.string().max(100).optional(),
  manufacturer: Joi.string().max(300).optional(),
  jurisdiction: Joi.string()
    .valid('US_OSHA', 'EU_CLP', 'UK_HSE', 'AU_WHS', 'CA_WHMIS', 'SA_SASO', 'CN_GB')
    .default('US_OSHA'),
  language: Joi.string().max(5).default('en'),
  additionalContext: Joi.string().max(2000).optional(),
}).or('chemicalName', 'casNumber', 'formula');

const updateSdsSchema = Joi.object({
  sections: Joi.object().optional(),
  status: Joi.string().valid('draft', 'pending_review', 'approved').optional(),
  expiresAt: Joi.string().isoDate().optional(),
  productCode: Joi.string().max(100).optional(),
});

const searchSdsSchema = Joi.object({
  q: Joi.string().max(200).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('draft', 'pending_review', 'approved').optional(),
  language: Joi.string().max(5).optional(),
  jurisdiction: Joi.string().optional(),
});

module.exports = { generateSdsSchema, updateSdsSchema, searchSdsSchema };
