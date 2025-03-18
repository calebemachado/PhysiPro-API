import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/domain-error';

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Log error for debugging
  console.error('Error:', err);

  // Handle domain errors
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details
    });
    return;
  }

  // Handle Sequelize-specific errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({
      message: 'Validation error',
      errors: (err as any).errors.map((e: any) => ({
        message: e.message,
        field: e.path,
        value: e.value
      }))
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
    return;
  }

  // Generic error response for unhandled errors
  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR'
  });
};

/**
 * Not found handler middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `Resource not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND'
  });
};
