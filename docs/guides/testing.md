# Testing Guide

This guide describes how to test the PhysiPro API during development.

## Testing Stack

The PhysiPro API uses the following tools for testing:

- **Jest**: Testing framework
- **Supertest**: HTTP assertions for API testing
- **ts-jest**: TypeScript support for Jest

## Test Types

### Unit Tests

Unit tests verify individual components in isolation, mocking their dependencies. These tests are located in `src/tests/unit`.

### Integration Tests

Integration tests verify interactions between components. These tests are located in `src/tests/integration`.

### End-to-End Tests

E2E tests verify the entire application flow. These tests are located in `src/tests/e2e`.

## Running Tests

You can run tests using the following commands:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests (requires PostgreSQL on port 5434)
npm run test:integration

# Run integration tests with Docker (recommended)
npm run test:integration:docker
```

### Docker Integration Testing

We've set up a Docker-based integration testing environment that:

1. Spins up a dedicated PostgreSQL container for testing
2. Runs the integration tests against this isolated database
3. Automatically tears down everything when the tests complete

This approach ensures:
- Tests run in a clean, isolated environment
- No conflicts with your development database
- Consistent test results across different machines
- No need to manually manage test databases

To run integration tests with Docker:

```bash
# Make sure Docker and Docker Compose are installed
npm run test:integration:docker
```

The script automatically:
- Builds the necessary Docker images
- Starts a PostgreSQL container
- Runs the tests
- Cleans up when done (even if tests fail)

### Run Unit Tests Only

```bash
npm test -- --testPathPattern=unit
```

### Run Integration Tests Only

```bash
npm test -- --testPathPattern=integration
```

### Run E2E Tests Only

```bash
npm test -- --testPathPattern=e2e
```

### Run a Specific Test File

```bash
npm test -- src/tests/unit/application/services/user.service.test.ts
```

## Writing Tests

### Unit Test Example

Here's an example of a unit test for a service:

```typescript
import { UserService } from '../../../../application/services/user.service';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { NotFoundError } from '../../../../domain/errors/domain-error';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      // ...other repository methods
    } as any;

    userService = new UserService(mockUserRepository);
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      // Arrange
      const mockUser = { id: '123', name: 'Test User' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById('123');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById('123'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
```

### Integration Test Example

Here's an example of an integration test for an API endpoint:

```typescript
import request from 'supertest';
import { app } from '../../../interfaces/http/app';
import { createTestUser, getAuthToken } from '../../helpers/auth';

describe('User API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const userData = await createTestUser();
    testUserId = userData.id;
    authToken = await getAuthToken(userData.email, 'password123');
  });

  describe('GET /api/users/:id', () => {
    it('should return 200 and user data when authenticated', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUserId);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
```

## Test Coverage

The project aims for at least 70% test coverage. You can view the test coverage report by running:

```bash
npm run test:coverage
```

This will generate a coverage report in the `coverage` directory and display a summary in the console.

## Mocking Dependencies

When writing unit tests, you'll need to mock dependencies. Jest provides several ways to do this:

### Manual Mocks

```typescript
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  // ...other methods
};
```

### Jest Mock Functions

```typescript
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));
```

### Spying on Methods

```typescript
const bcryptSpy = jest.spyOn(bcrypt, 'hash');
bcryptSpy.mockResolvedValue('hashed-password');
```

## Testing Best Practices

1. Follow the AAA (Arrange, Act, Assert) pattern
2. Test both success and failure cases
3. Use descriptive test names
4. Keep tests independent and isolated
5. Clean up after tests (if they modify shared resources)
6. Use realistic test data
7. Don't test external libraries
8. Aim for high test coverage, but prioritize critical paths 
