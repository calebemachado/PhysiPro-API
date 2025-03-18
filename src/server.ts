import app from './app';
import { sequelize, testDatabaseConnection } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || '3000';

// Test database connection
testDatabaseConnection();

// Sync database models (in production, use migrations instead)
const syncDatabase = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development, sync with { force: true } to drop tables and recreate
      // WARNING: This will delete all data. Only for development!
      await sequelize.sync({ force: process.env.DB_RESET === 'true' });
      console.info('Database synced successfully');
    } else {
      // In production, just sync without force
      await sequelize.sync();
      console.info('Database synced successfully');
    }
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await syncDatabase();
    
    app.listen(parseInt(PORT, 10), () => {
      console.info(`Server running on http://localhost:${PORT}`);
      console.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

startServer(); 