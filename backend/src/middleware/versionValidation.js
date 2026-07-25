const { body, query, param } = require('express-validator');

exports.validateSdsId = [
  param('sdsId').isUUID().withMessage('Invalid SDS ID'),
];

exports.validateCompare = [
  query('v1').isInt({ min: 1 }).withMessage('v1 must be a number'),
  query('v2').isInt({ min: 1 }).withMessage('v2 must be a number'),
];

exports.validateRollback = [
  body('version').isInt({ min: 1 }).withMessage('Version must be a number'),
];