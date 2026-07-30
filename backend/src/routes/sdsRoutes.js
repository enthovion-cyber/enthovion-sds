const express = require('express');
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validateRequest');
const { handleSdsUpload, handleBulkUpload } = require('../middleware/uploadMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { generateSdsSchema, updateSdsSchema, searchSdsSchema } = require('../validators/sdsValidators');

const generateSdsController = require('../controllers/sds/generateSdsController');
const uploadSdsController   = require('../controllers/sds/uploadSdsController');
const getAllSdsController    = require('../controllers/sds/getAllSdsController');
const getSdsByIdController  = require('../controllers/sds/getSdsByIdController');
const updateSdsController   = require('../controllers/sds/updateSdsController');
const deleteSdsController   = require('../controllers/sds/deleteSdsController');
const exportSdsController   = require('../controllers/sds/exportSdsController');
const approveSdsController  = require('../controllers/sds/approveSdsController');
const searchSdsController   = require('../controllers/sds/searchSdsController');
const getSdsLibrarySummaryController = require('../controllers/sds/getSdsLibrarySummaryController');

// All SDS routes require authentication (applied in routes/index.js)
router.get('/library-summary',                                                    asyncHandler(getSdsLibrarySummaryController));
router.get('/search',           validate(searchSdsSchema, 'query'),             asyncHandler(searchSdsController));
router.get('/',                                                                   asyncHandler(getAllSdsController));
router.post('/generate',        aiLimiter,  validate(generateSdsSchema),        asyncHandler(generateSdsController));
router.post('/upload',          handleSdsUpload,                                 asyncHandler(uploadSdsController));
router.post('/bulk-upload',     handleBulkUpload,                                asyncHandler(uploadSdsController));
router.get('/:id',                                                                asyncHandler(getSdsByIdController));
router.put('/:id',              validate(updateSdsSchema),                       asyncHandler(updateSdsController));
router.delete('/:id',                                                             asyncHandler(deleteSdsController));
router.post('/:id/approve',                                                       asyncHandler(approveSdsController));
router.get('/:id/export',                                                         asyncHandler(exportSdsController));

module.exports = router;
