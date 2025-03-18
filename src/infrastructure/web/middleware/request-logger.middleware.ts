import { Request, Response, NextFunction } from 'express';
import { apiLogger } from '../../logging/log-utils';

/**
 * Middleware to log HTTP requests and responses
 */
export const requestLogger = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Record the start time
    const startTime = process.hrtime();

    // Log the incoming request
    apiLogger.request(req, res);

    // Capture the original end method
    const originalEnd = res.end;

    // Override the end method to log the response
    res.end = function(chunk?: any, encoding?: BufferEncoding | undefined): Response {
      // Calculate duration in milliseconds
      const hrTime = process.hrtime(startTime);
      const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;

      // Log the response
      apiLogger.response(req, res, duration);

      // Call the original end method
      return originalEnd.apply(res, arguments as any);
    } as any;

    next();
  };
};
