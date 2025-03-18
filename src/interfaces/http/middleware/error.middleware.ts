import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/domain-error';

/**
 * Default error response structure
 */
interface ErrorResponse {
  status: string;
  message: string;
  details?: any;
}

/**
 * Global error handling middleware
 * Processes all errors and returns appropriate response
 */
export const errorMiddleware = (
  err: Error | DomainError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  const response: ErrorResponse = {
    status: 'error',
    message: err.message || 'Internal server error'
  };

  // Handle domain-specific errors
  if (err instanceof DomainError) {
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    res.status(400).json(response);
    return;
  }

  // Handle JWT authentication errors
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized access'
    });
    return;
  }

  // Handle other specific errors
  if (err.name === 'SyntaxError') {
    res.status(400).json({
      status: 'error',
      message: 'Invalid JSON'
    });
    return;
  }

  // Default to 500 internal server error
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error'
  });
};
