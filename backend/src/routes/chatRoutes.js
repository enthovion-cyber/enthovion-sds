const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validateRequest');
const { aiLimiter } = require('../middleware/rateLimiter');
const { sendMessageSchema } = require('../validators/chatValidators');

const chatController        = require('../controllers/chatbot/chatController');
const chatHistoryController = require('../controllers/chatbot/chatHistoryController');

router.post('/message',           aiLimiter, validate(sendMessageSchema), asyncHandler(chatController));
router.get('/history/:sdsId',     asyncHandler(chatHistoryController));

module.exports = router;
