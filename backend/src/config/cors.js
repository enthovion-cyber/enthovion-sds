const env = require('./env');

const allowedOrigins = [
  env.frontendUrl, // Ensure FRONTEND_URL=https://yourdomain.com in Vercel environment variables
  'https://sds.enthovion.com', // Replace with your actual live domain
  'https://www.yourdomain.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // 1. Check exact match from allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 2. Dynamically allow Vercel preview deployments (e.g., https://your-app-*.vercel.app)
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Reject unknown origins
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours preflight cache
};

module.exports = corsOptions;