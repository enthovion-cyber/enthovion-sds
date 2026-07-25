const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SafeSheet AI API',
      version: '1.0.0',
      description: 'AI-powered SDS/MSDS platform — REST API documentation',
    },
    servers: [
      { 
        url: `${env.frontendUrl || 'https://yourdomain.com'}/api/v1`, 
        description: 'Production' 
      },
      { 
        url: `http://localhost:${env.port || 5000}/api/v1`, 
        description: 'Development' 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Use path resolve or fallback gracefully if routes directory is not accessible in Vercel
  apis: [
    './src/routes/*.js',
    './routes/*.js',
    './src/routes/**/*.js',
    './routes/**/*.js'
  ],
};

let swaggerSpec = {};
try {
  swaggerSpec = swaggerJsdoc(options);
} catch (err) {
  console.warn('⚠️ Swagger Spec initialization warning:', err.message);
}

const setupSwagger = (app) => {
  try {
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'SafeSheet AI API Docs',
      })
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📚 API docs available at http://localhost:${env.port || 5000}/api/docs`);
    }
  } catch (err) {
    console.error('❌ Failed to mount Swagger UI:', err.message);
  }
};

module.exports = { setupSwagger, swaggerSpec };