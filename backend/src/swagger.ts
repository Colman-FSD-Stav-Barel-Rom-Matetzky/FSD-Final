import swaggerJsDoc from 'swagger-jsdoc';
import { AppConfig } from './config/app.config';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SocialApp API',
      version: '1.0.0',
      description: 'API Documentation for SocialApp',
    },
    servers: [
      {
        url: `http://localhost:${AppConfig.port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            profileImage: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsDoc(swaggerOptions);
