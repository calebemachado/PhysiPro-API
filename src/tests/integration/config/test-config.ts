import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables for test database connection
const {
  DB_NAME = 'physipro_test',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT = '5434',  // Use 5434 for local development, 5432 when inside Docker
  NODE_ENV = 'test'
} = process.env;

// Create Sequelize instance for testing
export const testSequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  logging: false, // Disable logging during tests
  define: {
    timestamps: true,
    underscored: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Initialize test database
 * This function will synchronize all models and reset the database
 */
export const initTestDatabase = async (): Promise<void> => {
  try {
    await testSequelize.authenticate();
    // Force sync drops all tables and recreates them
    await testSequelize.sync({ force: true });
    console.log('Test database initialized successfully');
  } catch (error) {
    console.error('Unable to initialize test database:', error);
    throw error;
  }
};

/**
 * Close test database connection
 */
export const closeTestDatabase = async (): Promise<void> => {
  try {
    await testSequelize.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error);
    throw error;
  }
};
