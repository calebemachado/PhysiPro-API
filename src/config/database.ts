import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

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

// Create Sequelize instance
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
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
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};
