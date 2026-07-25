const dotenv = require('dotenv');
dotenv.config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_EMAIL_VERIFY_SECRET',
  'JWT_RESET_SECRET',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.warn('⚠️ Warning: Missing core environment variables:');
  missing.forEach((key) => console.warn(`   - ${key}`));
  // DO NOT CALL process.exit(1) IN SERVERLESS/VERCEL HOOKS
}

module.exports = {
  port: parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    emailVerifySecret: process.env.JWT_EMAIL_VERIFY_SECRET || 'default_verify_secret',
    resetSecret: process.env.JWT_RESET_SECRET || 'default_reset_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    emailVerifyExpiresIn: process.env.JWT_EMAIL_VERIFY_EXPIRES_IN || '24h',
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  },

  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    openaiKey: process.env.OPENAI_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  email: {
    resendKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'SafeSheet AI <noreply@safesheet.ai>',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  integrations: {
    workflowWebhookUrl: process.env.WORKFLOW_WEBHOOK_URL || '',
  },

  storage: {
    bucketSds: process.env.STORAGE_BUCKET_SDS || 'sds-documents',
    bucketSop: process.env.STORAGE_BUCKET_SOP || 'sop-documents',
    bucketUploads: process.env.STORAGE_BUCKET_UPLOADS || 'raw-uploads',
  },

  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  },
};