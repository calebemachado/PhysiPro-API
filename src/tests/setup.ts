/**
 * Global setup for integration tests
 */

// Set the test environment
process.env.NODE_ENV = 'test';

// Set test database configuration if not already set
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5434'; // Using test port
  process.env.DB_NAME = 'physipro_test';
  process.env.DB_USER = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
}

// Set JWT secret for tests
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRES_IN = '1h';

// Increase Jest timeout for integration tests
jest.setTimeout(30000);

// Suppress console output during tests
// Comment the below lines if you want to see console output during tests
console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
