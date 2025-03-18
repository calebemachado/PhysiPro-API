import request from 'supertest';
import { app } from '../../interfaces/http/app';
import { seedTestUser, cleanupTestData } from './helpers/db-helper';
import { UserType } from '../../domain/entities/user';
import '../../tests/setup'; // Import global test setup

describe('Authentication API', () => {
  // Clean up database before tests
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate a user with valid credentials', async () => {
      // Arrange: Seed a test user
      const testUser = await seedTestUser({
        email: 'auth-test@example.com',
        password: await require('bcryptjs').hash('Password123!', 10)
      });

      // Act: Attempt to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'Password123!'
        });

      // Assert: Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 with invalid credentials', async () => {
      // Arrange: Seed a test user
      await seedTestUser({
        email: 'auth-test@example.com'
      });

      // Act: Attempt to login with wrong password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'WrongPassword123!'
        });

      // Assert: Verify the response
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 401 with non-existent user', async () => {
      // Act: Attempt to login with non-existent user
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      // Assert: Verify the response
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the authenticated user', async () => {
      // Arrange: Seed a test user
      const testUser = await seedTestUser();

      // Generate a token for the user
      const token = require('jsonwebtoken').sign(
        { sub: testUser.id, userType: testUser.userType },
        process.env.JWT_SECRET || 'test_jwt_secret',
        { expiresIn: '1h' }
      );

      // Act: Get current user profile
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert: Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without authentication', async () => {
      // Act: Try to get user profile without auth
      const response = await request(app)
        .get('/api/auth/me');

      // Assert: Verify the response
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Authorization header is missing');
    });
  });

  // We could add more tests for password reset, change password, etc.
});
