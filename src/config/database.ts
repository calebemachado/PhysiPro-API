import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { sequelizeLogger } from '../infrastructure/logging/sequelize-logger';
import { dbLogger } from '../infrastructure/logging/log-utils';

// Load environment variables
dotenv.config();

// Environment variables for database connection
const {
  DB_NAME = 'physipro',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  NODE_ENV = 'development'
} = process.env;

// Log database configuration (excluding sensitive data)
dbLogger.info('Database configuration loaded', {
  database: DB_NAME,
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  environment: NODE_ENV
});

// Create Sequelize instance
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  logging: NODE_ENV === 'production' ? false : sequelizeLogger.debug,
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
 * Test database connection
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    dbLogger.info('Database connection has been established successfully');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      dbLogger.error(error);
    } else {
      dbLogger.error(new Error(String(error)));
    }
    return false;
  }
};
