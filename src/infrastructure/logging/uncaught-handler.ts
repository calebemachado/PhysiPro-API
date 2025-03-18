import { logger } from './logger';

/**
 * Setup handlers for uncaught exceptions and unhandled rejections
 */
export const setupUncaughtHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
      error: error.message,
      stack: error.stack
    });

    // Log and exit with error
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(error.stack);

    // Exit with error
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error | any) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined
    });

    // Log and exit with error
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(reason);

    // Exit with error
    process.exit(1);
  });

  // Handle graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully!');
    console.log('SIGTERM received. Shutting down gracefully!');
    process.exit(0);
  });
};
