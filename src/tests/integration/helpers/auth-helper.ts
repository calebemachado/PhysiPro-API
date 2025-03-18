import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../../../interfaces/http/app';
import { User, UserType } from '../../../domain/entities/user';

/**
 * Create a test user via API
 */
export const createTestUser = async (userData: Partial<User> = {}): Promise<User> => {
  const defaultUserData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    cpf: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
    userType: UserType.TRAINER,
    active: true,
    ...userData
  };

  const response = await request(app)
    .post('/api/users')
    .send(defaultUserData);

  if (response.status !== 201) {
    throw new Error(`Failed to create test user: ${JSON.stringify(response.body)}`);
  }

  return response.body;
};

/**
 * Authenticate a user and return token
 */
export const authenticateUser = async (email: string, password: string): Promise<string> => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Failed to authenticate user: ${JSON.stringify(response.body)}`);
  }

  return response.body.token;
};

/**
 * Generate a test JWT token
 */
export const generateTestToken = (userId: string, userType: UserType = UserType.TRAINER): string => {
  return jwt.sign(
    { sub: userId, userType },
    process.env.JWT_SECRET || 'test_jwt_secret',
    { expiresIn: '1h' }
  );
};
