import bcrypt from 'bcryptjs';
import { testSequelize } from '../config/test-config';
import { User, UserType } from '../../../domain/entities/user';
import UserModel from '../../../infrastructure/persistence/sequelize/models/user.model';

/**
 * Seed a test user directly in the database
 */
export const seedTestUser = async (userData: Partial<User> = {}): Promise<User> => {
  try {
    // Generate a timestamp for unique values
    const timestamp = Date.now();

    // Default user data
    const defaultUserData = {
      id: `user-${timestamp}`,
      name: userData.name || 'Test User',
      email: userData.email || `test-${timestamp}@example.com`,
      password: userData.password || await bcrypt.hash('Password123!', 10),
      cpf: userData.cpf || Math.floor(10000000000 + Math.random() * 90000000000).toString(),
      userType: userData.userType || UserType.TRAINER,
      active: userData.active !== undefined ? userData.active : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use raw SQL query for direct insertion to bypass validation issues
    await testSequelize.query(`
      INSERT INTO "Users" (
        "id", "name", "email", "password", "cpf", "userType", "active", "createdAt", "updatedAt"
      ) VALUES (
        :id, :name, :email, :password, :cpf, :userType, :active, :createdAt, :updatedAt
      )
    `, {
      replacements: defaultUserData,
      type: 'INSERT'
    });

    // Remove the password before returning
    const { password, ...userWithoutPassword } = defaultUserData;
    return userWithoutPassword as unknown as User;
  } catch (error) {
    console.error('Error seeding test user:', error);
    throw error;
  }
};

/**
 * Clean up test data
 */
export const cleanupTestData = async (): Promise<void> => {
  try {
    // Check if the Users table exists before truncating
    const [tableResult] = await testSequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Users'
      ) as exists
    `, { type: 'SELECT' });

    // If the table exists, truncate it
    if (tableResult && (tableResult as any).exists) {
      await testSequelize.query('TRUNCATE TABLE "Users" CASCADE');
    } else {
      console.log('Users table does not exist yet, skipping cleanup');
    }

    // Add more tables to clean up as needed
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
};
