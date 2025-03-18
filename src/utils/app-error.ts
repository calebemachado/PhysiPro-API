import { AppErrorOptions } from '../types/model';

/**
 * Custom application error class
 * Extends the built-in Error class with additional properties for API error handling
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  /**
   * Create a new application error
   * @param message Error message
   * @param statusCode HTTP status code (default: 500)
   */
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace, excluding constructor call from stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to a plain object for response
   * @returns Error as plain object
   */
  toJSON(): AppErrorOptions {
    return {
      message: this.message,
      statusCode: this.statusCode,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
} 