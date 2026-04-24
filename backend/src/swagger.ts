import swaggerJsDoc from 'swagger-jsdoc';
import { AppConfig } from './config/app.config';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Threadly API',
      version: '1.0.0',
      description: 'API Documentation for Threadly',
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
          required: ['_id', 'content', 'owner', 'likes', 'createdAt'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique post identifier',
              example: '60d5ec49f1b2c8a1b4e1a123',
            },
            content: {
              type: 'string',
              description: 'Post text content',
              example: 'Hello world!',
            },
            image: {
              type: 'string',
              description: 'Relative URL to uploaded image',
              example: '/uploads/posts/photo-123.jpg',
              nullable: true,
            },
            owner: {
              type: 'object',
              description: 'Details of the post author',
              properties: {
                _id: { type: 'string', example: '60d5ec49f1b2c8a1b4e1a456' },
                username: { type: 'string', example: 'testuser' },
                profileImage: {
                  type: 'string',
                  example: '/uploads/profiles/photo-123.jpg',
                  nullable: true,
                },
              },
            },
            likes: {
              type: 'array',
              description: 'Array of user IDs who liked the post',
              items: { type: 'string' },
              example: ['60d5ec49f1b2c8a1b4e1a456'],
            },
            commentCount: {
              type: 'integer',
              description: 'Number of comments on the post',
              example: 5,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp of creation',
              example: '2023-06-25T12:00:00.000Z',
            },
          },
        },
        Comment: {
          type: 'object',
          required: ['_id', 'content', 'owner', 'post', 'createdAt'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique comment identifier',
              example: '60d5ec49f1b2c8a1b4e1a789',
            },
            content: {
              type: 'string',
              description: 'Comment text content',
              example: 'Great post!',
            },
            owner: {
              type: 'object',
              description: 'Details of the comment author',
              properties: {
                _id: { type: 'string', example: '60d5ec49f1b2c8a1b4e1a456' },
                username: { type: 'string', example: 'testuser' },
                profileImage: {
                  type: 'string',
                  example: '/uploads/profiles/photo-123.jpg',
                  nullable: true,
                },
              },
            },
            post: {
              type: 'string',
              description: 'Post ID this comment belongs to',
              example: '60d5ec49f1b2c8a1b4e1a123',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp of creation',
              example: '2023-06-25T12:05:00.000Z',
            },
          },
        },
        PaginatedPosts: {
          type: 'object',
          required: ['data', 'nextCursor'],
          properties: {
            data: {
              type: 'array',
              description: 'Array of posts for the current page',
              items: { $ref: '#/components/schemas/Post' },
            },
            nextCursor: {
              type: 'string',
              description:
                'Cursor ID for fetching the next page, or null if no more results',
              nullable: true,
              example: '60d5ec49f1b2c8a1b4e1a123',
            },
          },
        },
        PaginatedComments: {
          type: 'object',
          required: ['data', 'nextCursor'],
          properties: {
            data: {
              type: 'array',
              description: 'Array of comments for the current page',
              items: { $ref: '#/components/schemas/Comment' },
            },
            nextCursor: {
              type: 'string',
              description:
                'Cursor ID for fetching the next page, or null if no more results',
              nullable: true,
              example: '60d5ec49f1b2c8a1b4e1a789',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Unauthorized',
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description:
            'Authenticated user does not have permission to perform this action',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Forbidden',
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Requested resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Resource not found',
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description:
            'Request validation failed due to missing or invalid fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Content is required',
                  },
                },
              },
            },
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
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsDoc(swaggerOptions);
