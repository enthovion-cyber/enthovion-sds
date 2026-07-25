const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');

const corsOptions    = require('./config/cors');
const requestLogger  = require('./middleware/requestLogger');
const errorHandler   = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const routes         = require('./routes/index');
const { cleanupExpired } = require('./services/auth/otpService');
const { runContinuousScanGlobal } = require('./services/compliance/continuousComplianceService');
const { error } = require('./utils/responseHelper');

const app = express();

// ── Proxy Configuration (CRITICAL for Vercel + rateLimiter) ──
app.set('trust proxy', 1);

// ── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ── Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────────────
app.use(requestLogger);

// ── Rate limiting ────────────────────────────────────────
app.use(globalLimiter);

// ── Health check ─────────────────────────────────────────
app.get(['/health', '/api/v1/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'safesheet-ai-api' });
});

// ── API Routes ───────────────────────────────────────────
// Mounts routes under both /api/v1 and root / to support Vercel rewrite rules
app.use('/api/v1', routes);
app.use('/', routes);

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  error(res, `Route ${req.method} ${req.path} not found`, 404);
});

// ── Global Error Handler (must be last) ──────────────────
app.use(errorHandler);

// ── Cron Jobs (Only enabled in standard server mode, disabled in Vercel Serverless) ──
if (process.env.VERCEL !== '1') {
  // Clean up expired OTP codes every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await cleanupExpired();
    } catch (e) {
      console.error('[CRON] OTP cleanup failed:', e.message);
    }
  });

  // Run continuous compliance engine every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const snapshot = await runContinuousScanGlobal();
      console.log(
        `[CRON] Continuous compliance scan complete: compliant=${snapshot?.summary?.compliant ?? 0}, risk=${snapshot?.summary?.risk ?? 0}, violations=${snapshot?.summary?.violations ?? 0}`
      );
    } catch (e) {
      console.error('[CRON] Continuous compliance scan failed:', e.message);
    }
  });
}

module.exports = app;