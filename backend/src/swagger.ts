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
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            content: { type: 'string' },
            image: {
              type: 'string',
              description: 'Relative URL to image',
            },
            owner: { type: 'string' },
            likes: {
              type: 'array',
              items: { type: 'string' },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            content: { type: 'string' },
            owner: { type: 'string' },
            post: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
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
