import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PhysiPro API',
      version: '1.0.0',
      description: 'REST API for PhysiPro with role-based access',
      contact: {
        name: 'PhysiPro Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
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
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            cpf: {
              type: 'string',
            },
            userType: {
              type: 'string',
              enum: ['ADMIN', 'TRAINER', 'STUDENT'],
            },
            profileImage: {
              type: 'string',
              nullable: true,
            },
            trainerId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            active: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            stack: {
              type: 'string',
              nullable: true,
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication related endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsDoc(options);

export const serve = swaggerUi.serve;
export const setup = swaggerUi.setup(specs); 