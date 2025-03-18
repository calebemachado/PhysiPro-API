import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './config/passport';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { serve as swaggerServe, setup as swaggerSetup } from './config/swagger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// API Documentation
app.use('/api-docs', swaggerServe, swaggerSetup);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to PhysiPro API',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 