const { badRequest } = require('../utils/responseHelper');

/**
 * validate(schema, property) — validates req[property] against Joi schema
 * property: 'body' | 'query' | 'params'
 *
 * Usage: router.post('/login', validate(loginSchema), loginController)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,    // Return ALL errors, not just first
      stripUnknown: true,   // Remove fields not in schema
      convert: true,        // Convert types (string '1' → number 1)
    });

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, ''));
      return badRequest(res, 'Validation failed', messages);
    }

    req[property] = value; // Replace with sanitised value
    next();
  };
};

module.exports = validate;
