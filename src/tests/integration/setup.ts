import { initTestDatabase, closeTestDatabase } from './config/test-config';

// Global setup - runs before all tests
beforeAll(async () => {
  // Initialize test database
  await initTestDatabase();
});

// Global teardown - runs after all tests
afterAll(async () => {
  // Close test database connection
  await closeTestDatabase();
});
