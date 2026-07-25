const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validateRequest');
const { aiLimiter } = require('../middleware/rateLimiter');
const { generateSopSchema, updateSopSchema } = require('../validators/sopValidators');

const generateSopController = require('../controllers/sop/generateSopController');
const getAllSopsController   = require('../controllers/sop/getAllSopsController');
const getSopByIdController  = require('../controllers/sop/getSopByIdController');
const updateSopController   = require('../controllers/sop/updateSopController');
const exportSopController   = require('../controllers/sop/exportSopController');

router.get('/',             asyncHandler(getAllSopsController));
router.post('/generate',    aiLimiter, validate(generateSopSchema), asyncHandler(generateSopController));
router.get('/:id',          asyncHandler(getSopByIdController));
router.put('/:id',          validate(updateSopSchema), asyncHandler(updateSopController));
router.get('/:id/export',   asyncHandler(exportSopController));

module.exports = router;
