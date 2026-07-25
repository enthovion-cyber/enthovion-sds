const env = require('./src/config/env');
const { testConnection } = require('./src/config/database');
const app = require('./src/app');

// Local standalone server launcher
const start = async () => {
  try {
    // Non-blocking database check
    await testConnection();
  } catch (err) {
    console.warn('⚠️ Supabase initial connection check failed:', err.message);
  }

  app.listen(env.port, () => {
    console.log(`\n🚀 SafeSheet AI API running`);
    console.log(`   Port    : ${env.port}`);
    console.log(`   Env     : ${env.nodeEnv}`);
    console.log(`   Docs    : http://localhost:${env.port}/api/v1`);
    console.log(`   Health  : http://localhost:${env.port}/health\n`);
  });
};

// Only trigger app.listen() if NOT running inside Vercel serverless environment
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  start();
}

// CRITICAL FOR VERCEL: Export the Express app as the main handler
module.exports = app;