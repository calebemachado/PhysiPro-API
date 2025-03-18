# Code Standards

This document outlines the coding standards and best practices for the PhysiPro API project. Following these standards ensures code consistency, maintainability, and quality across the codebase.

## TypeScript Guidelines

### General Principles

- Write clean, readable, and self-documenting code
- Follow the DRY (Don't Repeat Yourself) principle
- Keep functions small and focused on a single responsibility
- Use English for all code, comments, and documentation
- Prioritize code readability over clever optimizations

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-service.ts` |
| Directories | kebab-case | `auth-middleware/` |
| Classes | PascalCase | `UserService` |
| Interfaces | PascalCase | `UserProfile` |
| Types | PascalCase | `ApiResponse` |
| Functions/Methods | camelCase | `getUserProfile()` |
| Variables | camelCase | `userCount` |
| Constants | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Enum | PascalCase | `UserRole` |
| Enum members | PascalCase | `UserRole.Admin` |

### Typing

- Always declare explicit types for variables, parameters, and return values
- Avoid using `any` type - use `unknown` when type is truly unknown
- Use interfaces for object shapes and types for unions, intersections, and primitive types
- Use type predicates and type guards to narrow types when necessary
- Prefer readonly properties and arrays when data should not be mutated

```typescript
// Good
function getUserById(id: string): Promise<User> {
  // ...
}

// Avoid
function getUserById(id): Promise<any> {
  // ...
}
```

### Functions

- Start function names with a verb
- For boolean-returning functions, use prefixes like `is`, `has`, or `can`
- Keep functions under 20 lines of code when possible
- Limit function parameters (use object parameter for 3+ arguments)
- Use default parameter values when appropriate
- Implement early returns for guard clauses

```typescript
// Good - using object parameters for many arguments
function createUser({
  name,
  email,
  role,
  active = true
}: {
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
}): Promise<User> {
  // Implementation...
}

// Good - early return
function processUser(user: User | null): UserDTO {
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Process user...
  return mappedUser;
}
```

## Project Structure

Our project follows Clean Architecture principles with the following structure:

```
src/
├── domain/                 # Domain layer - business entities and logic
│   ├── entities/           # Domain entities
│   ├── errors/             # Domain-specific errors
│   ├── repositories/       # Repository interfaces
│   └── value-objects/      # Value objects
├── application/            # Application layer - use cases and services
│   ├── dtos/               # Data Transfer Objects
│   ├── mappers/            # Mappers between entities and DTOs
│   └── services/           # Application services implementing use cases
├── infrastructure/         # Infrastructure layer - external dependencies
│   ├── database/           # Database implementation
│   ├── repositories/       # Repository implementations
│   └── services/           # External service implementations
└── interface/              # Interface layer - external interfaces
    ├── api/                # API routes and controllers
    ├── middleware/         # Express middleware
    └── validators/         # Request validation
```

### Layer Dependencies

- **Domain layer** should have NO dependencies on other layers
- **Application layer** can depend on Domain layer only
- **Infrastructure layer** can depend on Domain and Application layers
- **Interface layer** can depend on all other layers

## Error Handling

- Use custom error classes extending from base Error
- Implement domain-specific errors in the domain layer
- Implement HTTP-specific errors in the interface layer
- Always include meaningful error messages
- Log errors appropriately based on severity
- Never expose sensitive information in error messages to clients

```typescript
// Domain-specific error
export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

// HTTP-specific error
export class NotFoundError extends Error {
  public readonly statusCode = 404;
  
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

## Comments and Documentation

- Use JSDoc comments for public classes, interfaces, and methods
- Document API endpoints using OpenAPI/Swagger annotations
- Write self-documenting code instead of explaining obvious functionality
- Comments should explain "why" rather than "what" when the code is complex
- Keep comments up-to-date with code changes

```typescript
/**
 * Retrieves a user by ID
 * 
 * @param id - The unique identifier of the user
 * @returns The user if found
 * @throws {UserNotFoundError} If user doesn't exist
 */
async function getUserById(id: string): Promise<User> {
  // Implementation...
}
```

## Testing Standards

- Write unit tests for all services, repositories, and utilities
- Write integration tests for API endpoints
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies in unit tests
- Use descriptive test names that explain the expected behavior
- Aim for high test coverage (minimum 70% for critical paths)

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const mockUser = { id: '123', name: 'Test User' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.getUserById('123');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
    });
    
    it('should throw UserNotFoundError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.getUserById('unknown')).rejects.toThrow(UserNotFoundError);
    });
  });
});
```

## Linting and Formatting

We use the following tools to enforce code standards:

- **ESLint** for code quality and style checking
- **Prettier** for code formatting
- **TypeScript** compiler for type checking

These checks run as pre-commit hooks and during CI/CD pipeline.

### ESLint Configuration

Key ESLint rules we enforce:

- no-unused-vars
- no-console (except in development)
- no-return-await
- explicit-function-return-type
- explicit-module-boundary-types
- no-explicit-any
- prefer-const

### Prettier Configuration

Our Prettier configuration enforces:

- 2 spaces for indentation
- Single quotes for strings
- Semicolons at the end of statements
- No trailing commas
- 100 character line length

## Git Workflow

- Use Conventional Commits for commit messages
- Branch naming: `feature/feature-name`, `fix/bug-description`, `refactor/description`
- Create Pull Requests for all changes
- Keep PRs focused on a single feature or fix
- Update tests and documentation with code changes

## Security Standards

- Never store secrets in code or commit them to the repository
- Use environment variables for all sensitive configuration
- Sanitize and validate all user input
- Implement proper authentication and authorization checks
- Use parameterized queries to prevent SQL injection
- Set proper HTTP security headers
- Follow OWASP security best practices

## Performance Considerations

- Use async/await for asynchronous operations
- Implement pagination for list endpoints
- Use database indexes for frequently queried fields
- Cache expensive operations when appropriate
- Minimize external API calls
- Optimize database queries to reduce round trips 
