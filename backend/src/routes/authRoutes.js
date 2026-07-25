const express = require('express');
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} = require('../validators/authValidators');

const registerController      = require('../controllers/auth/registerController');
const loginController         = require('../controllers/auth/loginController');
const logoutController        = require('../controllers/auth/logoutController');
const refreshTokenController  = require('../controllers/auth/refreshTokenController');
const forgotPasswordController = require('../controllers/auth/forgotPasswordController');
const verifyOtpController     = require('../controllers/auth/verifyOtpController');
const resetPasswordController = require('../controllers/auth/resetPasswordController');
const changePasswordController = require('../controllers/auth/changePasswordController');
const emailVerifyController   = require('../controllers/auth/emailVerifyController');
const resendVerifyController  = require('../controllers/auth/resendVerifyController');

// Public routes
router.post('/register',         authLimiter, validate(registerSchema),        asyncHandler(registerController));
router.post('/login',            authLimiter, validate(loginSchema),            asyncHandler(loginController));
router.post('/refresh-token',               validate(refreshTokenSchema),        asyncHandler(refreshTokenController));
router.post('/forgot-password',  otpLimiter,  validate(forgotPasswordSchema),   asyncHandler(forgotPasswordController));
router.post('/verify-otp',                  validate(verifyOtpSchema),           asyncHandler(verifyOtpController));
router.post('/reset-password',              validate(resetPasswordSchema),        asyncHandler(resetPasswordController));
router.get('/verify-email',                                                       asyncHandler(emailVerifyController));

// Protected routes (require login)
router.post('/logout',           authenticate,                                   asyncHandler(logoutController));
router.post('/change-password',  authenticate, validate(changePasswordSchema),  asyncHandler(changePasswordController));
router.post('/resend-verify',    authenticate, otpLimiter,                       asyncHandler(resendVerifyController));

module.exports = router;
