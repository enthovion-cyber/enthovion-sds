const env = require('./src/config/env');
const { testConnection } = require('./src/config/database');
const app = require('./src/app');

const start = async () => {
  // Verify Supabase connection
  await testConnection();

  app.listen(env.port, () => {
    console.log(`\n🚀 SafeSheet AI API running`);
    console.log(`   Port    : ${env.port}`);
    console.log(`   Env     : ${env.nodeEnv}`);
    console.log(`   Docs    : http://localhost:${env.port}/api/v1`);
    console.log(`   Health  : http://localhost:${env.port}/health\n`);
  });
};

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
