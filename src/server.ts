import dotenv from 'dotenv';
import { app } from './interfaces/http/app';
import { sequelize } from './config/database';
import { syncModels } from './infrastructure/persistence/sequelize/models';
import { logger } from './infrastructure/logging/logger';
import { appLogger, dbLogger } from './infrastructure/logging/log-utils';
import { setupUncaughtHandlers } from './infrastructure/logging/uncaught-handler';

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 3000;

// Log environment and configuration (sanitized)
appLogger.config({
  NODE_ENV: process.env.NODE_ENV,
  PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_SYNC_FORCE: process.env.DB_SYNC_FORCE
});

// Setup handlers for uncaught exceptions and unhandled rejections
setupUncaughtHandlers();

/**
 * Sync database models
 * Warning: setting force to true will drop tables in development
 */
async function syncDatabase(): Promise<void> {
  try {
    // In development, we might want to sync the database with { force: true }
    // to recreate tables, but this would delete all data
    const force = process.env.NODE_ENV === 'development' &&
                  process.env.DB_SYNC_FORCE === 'true';

    if (force) {
      logger.warn('WARNING: Database sync with { force: true } will delete all data!');
    }

    await syncModels(force);
    dbLogger.info('Database models synchronized successfully', { force });
  } catch (error) {
    logger.error('Failed to sync database', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Test the database connection
 */
async function testDatabaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    dbLogger.info('Database connection established successfully');
  } catch (error) {
    dbLogger.error(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    appLogger.startup('Starting PhysiPro API server');

    // Test database connection and sync models
    logger.info('Testing database connection...');
    await testDatabaseConnection();

    logger.info('Synchronizing database models...');
    await syncDatabase();

    // Start the server
    app.listen(PORT, () => {
      appLogger.startup(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        docs: `http://localhost:${PORT}/api-docs`
      });
    });
  } catch (error) {
    logger.error('Server startup failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Start the server
startServer();
