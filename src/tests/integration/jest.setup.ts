import { initTestDatabase, closeTestDatabase } from './config/test-config';
import UserModel from '../../infrastructure/persistence/sequelize/models/user.model';

// Setup - runs before all tests
beforeAll(async () => {
  console.log('Setting up integration test environment...');

  try {
    // Initialize test database (create tables, etc.)
    await initTestDatabase();
    console.log('Test database initialized for all tests');

    // Ensure models are defined and tables are created
    await UserModel.sync({ force: true });
    console.log('User model synchronized successfully');
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
});

// Teardown - runs after all tests
afterAll(async () => {
  // Close database connection
  await closeTestDatabase();
  console.log('Test database connection closed after all tests');
});
