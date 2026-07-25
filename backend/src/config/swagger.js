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
      { url: `http://localhost:${env.port}/api/v1`, description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SafeSheet AI API Docs',
  }));
  console.log(`📚 API docs available at http://localhost:${env.port}/api/docs`);
};

module.exports = { setupSwagger, swaggerSpec };
