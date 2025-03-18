import request from 'supertest';
import { app } from '../../interfaces/http/app';
import { seedTestUser, cleanupTestData } from './helpers/db-helper';
import { generateTestToken } from './helpers/auth-helper';
import { UserType } from '../../domain/entities/user';
import '../../tests/setup'; // Import global test setup

describe('User API', () => {
  // Clean up database before tests
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      // Arrange: Create admin user for authentication
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);

      // Act: Create a new user
      const userData = {
        name: 'New Test User',
        email: 'new-user@example.com',
        password: 'Password123!',
        cpf: '12345678901',
        userType: UserType.TRAINER
      };
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(userData);

      // Assert: Verify the response
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 when user with email already exists', async () => {
      // Arrange: Create admin user and existing user
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);

      const existingEmail = 'existing@example.com';
      await seedTestUser({
        email: existingEmail
      });

      // Act: Try to create a user with the same email
      const userData = {
        name: 'Duplicate User',
        email: existingEmail,
        password: 'Password123!',
        cpf: '98765432109',
        userType: UserType.STUDENT
      };
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(userData);

      // Assert: Verify the response
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 with invalid user data', async () => {
      // Arrange: Create admin user
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);

      // Act: Try to create user with invalid data
      const userData = {
        name: 'Invalid User',
        // Missing email and other required fields
        password: 'weak'
      };
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(userData);

      // Assert: Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      // Arrange: Create a test user and generate token
      const testUser = await seedTestUser();
      const token = generateTestToken(testUser.id);

      // Act: Get the user by ID
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert: Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      // Arrange: Create a test user and generate token
      const testUser = await seedTestUser();
      const token = generateTestToken(testUser.id);
      const nonExistentId = 'non-existent-id';

      // Act: Try to get non-existent user
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert: Verify the response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/users', () => {
    it('should return a list of users', async () => {
      // Arrange: Create an admin user and additional users
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);

      await seedTestUser({ name: 'User 1' });
      await seedTestUser({ name: 'User 2' });

      // Act: Get the list of users
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      // Assert: Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThanOrEqual(3); // Admin + 2 users
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('should filter users by userType', async () => {
      // Arrange: Create an admin user and users with different types
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);

      await seedTestUser({ userType: UserType.TRAINER });
      await seedTestUser({ userType: UserType.STUDENT });

      // Act: Get the list of trainers
      const response = await request(app)
        .get('/api/users?userType=' + UserType.TRAINER)
        .set('Authorization', `Bearer ${token}`);

      // Assert: Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.every(user => user.userType === UserType.TRAINER)).toBe(true);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      // Arrange: Create a test user and generate token
      const testUser = await seedTestUser();
      const token = generateTestToken(testUser.id);
      const updatedName = 'Updated User Name';

      // Act: Update the user
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: updatedName
        });

      // Assert: Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('name', updatedName);
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('should return 404 when updating non-existent user', async () => {
      // Arrange: Create a test user with admin privileges
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);
      const nonExistentId = 'non-existent-id';

      // Act: Try to update non-existent user
      const response = await request(app)
        .put(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        });

      // Assert: Verify the response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      // Arrange: Create an admin user and a user to delete
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);

      const userToDelete = await seedTestUser();

      // Act: Delete the user
      const response = await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert: Verify the response
      expect(response.status).toBe(204);

      // Verify the user is deleted
      const getResponse = await request(app)
        .get(`/api/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent user', async () => {
      // Arrange: Create an admin user
      const adminUser = await seedTestUser({
        userType: UserType.ADMIN
      });
      const token = generateTestToken(adminUser.id, UserType.ADMIN);
      const nonExistentId = 'non-existent-id';

      // Act: Try to delete non-existent user
      const response = await request(app)
        .delete(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert: Verify the response
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });
});
