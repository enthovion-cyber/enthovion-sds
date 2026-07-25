const Joi = require('joi');

const sendMessageSchema = Joi.object({
  sdsId: Joi.string().uuid().required(),
  message: Joi.string().min(1).max(2000).required(),
  sessionId: Joi.string().uuid().optional(),
  language: Joi.string().valid('en', 'ar', 'fr', 'de', 'es').default('en'),
});

module.exports = { sendMessageSchema };
