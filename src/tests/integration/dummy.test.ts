import request from 'supertest';
import { app } from '../../interfaces/http/app';

describe('Dummy Tests', () => {
  // A dummy test to make sure our test setup works
  it('should pass always', () => {
    expect(true).toBe(true);
  });

  // A simple API test that doesn't require database setup
  it('should return 401 for an unauthenticated request', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Authorization header is missing');
  });
});
