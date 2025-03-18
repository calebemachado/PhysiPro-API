import dotenv from 'dotenv';
import { app } from './interfaces/http/app';
import { sequelize } from './config/database';
import { syncModels } from './infrastructure/persistence/sequelize/models';

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 3000;

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
      console.warn('WARNING: Database sync with { force: true } will delete all data!');
    }

    await syncModels(force);
  } catch (error) {
    console.error('Failed to sync database:', error);
    throw error;
  }
}

/**
 * Test the database connection
 */
async function testDatabaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Test database connection and sync models
    await testDatabaseConnection();
    await syncDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Start the server
startServer();
