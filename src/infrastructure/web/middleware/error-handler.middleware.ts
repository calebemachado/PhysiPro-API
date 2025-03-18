import { Request, Response, NextFunction } from 'express';
import { apiLogger } from '../../logging/log-utils';

/**
 * Global error handler middleware
 */
export const errorHandler = () => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Log the error
    apiLogger.error(req, err);

    // Define error response structure
    const errorResponse = {
      status: 'error',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'An unexpected error occurred',
      code: err.name === 'ValidationError' ? 400 : 500,
      details: process.env.NODE_ENV === 'production' ? undefined : {
        stack: err.stack,
        name: err.name
      }
    };

    // Send response
    res.status(errorResponse.code).json(errorResponse);
  };
};
