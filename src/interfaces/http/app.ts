import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
// Use require for compression to avoid TypeScript issues
const compression = require('compression');
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './middleware/error.middleware';
import { userRoutes } from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';
import swaggerSpec from './swagger';

/**
 * Express application setup
 */
class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configure Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());

    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Performance middleware
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('dev'));
    }
  }

  /**
   * Configure API routes
   */
  private setupRoutes(): void {
    // API Documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Root route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Welcome to PhysiPro API',
        documentation: `${req.protocol}://${req.get('host')}/api-docs`
      });
    });

    // API Routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);

    // 404 Handler - Must be last route
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: `Path ${req.path} not found`
      });
    });
  }

  /**
   * Configure error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}

// Export the Express app
export const app = new App().app;
