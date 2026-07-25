const Joi = require('joi');

const auditSdsSchema = Joi.object({
  jurisdiction: Joi.string()
    .valid('US_OSHA', 'EU_CLP', 'UK_HSE', 'AU_WHS', 'CA_WHMIS', 'SA_SASO', 'CN_GB')
    .default('US_OSHA'),
});

const auditLibrarySchema = Joi.object({
  jurisdiction: Joi.string()
    .valid('US_OSHA', 'EU_CLP', 'UK_HSE', 'AU_WHS', 'CA_WHMIS', 'SA_SASO', 'CN_GB')
    .default('US_OSHA'),
});

module.exports = { auditSdsSchema, auditLibrarySchema };
