import swaggerJsDoc from 'swagger-jsdoc';

/**
 * Swagger configuration options
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PhysiPro API',
      version: '1.0.0',
      description: 'API for the PhysiPro application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'PhysiPro Team',
        url: 'https://physipro.com',
        email: 'contact@physipro.com',
      },
    },
    servers: [
      {
        url: '/api',
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
          required: ['name', 'email', 'cpf', 'password', 'userType'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            cpf: {
              type: 'string',
              description: 'User CPF number',
            },
            userType: {
              type: 'string',
              enum: ['ADMIN', 'TRAINER', 'STUDENT'],
              description: 'User type',
            },
            active: {
              type: 'boolean',
              description: 'Whether the user is active',
              default: true,
            },
            trainerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the trainer for student accounts',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
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
  apis: ['./src/interfaces/http/routes/*.ts', './src/interfaces/http/controllers/*.ts'],
};

/**
 * Generate Swagger specification
 */
const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;
