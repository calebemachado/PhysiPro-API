/**
 * Script to check database connection for tests and start the database if needed
 */
const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Get database config from environment variables
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5434'; // Default to test port
const dbName = process.env.DB_NAME || 'physipro_test';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

console.log(`Checking database connection to ${dbHost}:${dbPort}/${dbName}...`);

// Create a Sequelize instance for connection test
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    connectTimeout: 5000 // 5 seconds
  }
});

// Function to start the database container
async function startDatabaseContainer() {
  try {
    console.log('Starting database container...');
    await execAsync('docker-compose -f docker/test/docker-compose.test.yml up -d postgres-test');

    // Wait for the database to be ready
    console.log('Waiting for database to be ready...');

    // Try to connect with increasing delays
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        console.log(`Connection attempt ${attempt}/10...`);
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        return true;
      } catch (error) {
        if (attempt === 10) {
          console.error('Failed to connect to database after 10 attempts');
          return false;
        }
        // Exponential backoff with a bit of randomness
        const delay = Math.floor(1000 * Math.pow(1.5, attempt) + Math.random() * 300);
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } catch (error) {
    console.error('Error starting database container:', error.message);
    return false;
  }
}

// Try to authenticate to the database
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Unable to connect to the database:', err.message);

    // Try to start the database container if needed
    try {
      const isDocker = await execAsync('command -v docker').then(() => true).catch(() => false);

      if (isDocker) {
        console.log('Docker is available. Trying to start database container...');
        const started = await startDatabaseContainer();
        if (started) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      } else {
        console.error('Docker is not available. Cannot start database container.');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error checking for Docker:', error.message);
      process.exit(1);
    }
  });
