# Development Workflow

This guide outlines the recommended development workflow for the PhysiPro API.

## Setting Up Your Development Environment

### Prerequisites

- Node.js (v14.x or later)
- npm (v7.x or later)
- PostgreSQL (v12.x or later)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/physipro-api.git
   cd physipro-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your local configuration.

4. **Set up the database**
   ```bash
   # Create a new PostgreSQL database
   psql -U postgres -c "CREATE DATABASE physipro_dev;"
   
   # Run migrations
   npm run db:migrate
   
   # (Optional) Seed the database with sample data
   npm run db:seed
   ```

## Development Cycle

### 1. Branch Strategy

We use a feature branch workflow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/your-feature-name` - Individual feature branches

To start working on a new feature:

```bash
git checkout develop
git pull
git checkout -b feature/your-feature-name
```

### 2. Development Server

Start the development server with:

```bash
npm run dev
```

This will run the application with hot-reloading enabled.

### 3. Code Quality Tools

Before committing changes, ensure your code meets the project's quality standards:

```bash
# Run linting
npm run lint

# Fix automatically fixable linting issues
npm run lint:fix

# Check TypeScript types
npm run typecheck
```

### 4. Testing

Write tests for your changes and run them:

```bash
# Run all tests
npm test

# Run only tests for a specific component
npm test -- --testPathPattern=user.service

# Run tests with coverage
npm run test:coverage
```

See the [Testing Guide](./testing.md) for more details on testing.

### 5. Committing Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```bash
feat: add user registration endpoint
fix: resolve token expiration issue
docs: update API documentation
test: add tests for auth service
refactor: improve error handling in controllers
```

### 6. Pull Requests

When your feature is ready:

1. Push your branch to the remote repository
   ```bash
   git push -u origin feature/your-feature-name
   ```

2. Create a Pull Request (PR) to the `develop` branch
   - Add a clear description of the changes
   - Reference relevant issues
   - Ensure all tests pass
   - Request reviews from team members

3. Address review feedback with additional commits

4. Once approved, merge your PR using the squash and merge option

### 7. Continuous Integration

Our CI pipeline automatically runs on each PR:

- Linting
- Type checking
- Unit tests
- Integration tests
- Code coverage checks

Ensure all checks pass before merging.

## Database Migrations

### Creating Migrations

When you need to change the database schema:

```bash
# Create a new migration
npm run db:migration:create -- --name=add_user_profile_fields

# Apply the migration
npm run db:migrate

# Revert the last migration (if needed)
npm run db:migrate:undo
```

### Generating Models

After creating migrations, update your Sequelize models:

```bash
# Update models based on database schema
npm run models:generate
```

## API Documentation

Keep the API documentation up to date as you develop:

1. Update Swagger annotations in your controllers
2. Update the documentation files in the `docs/api` directory
3. Test the API documentation at `http://localhost:3000/api-docs`

## Common Development Tasks

### Adding a New Domain Entity

1. Create the entity in `src/domain/entities/`
2. Create the repository interface in `src/domain/repositories/`
3. Create the database migration
4. Implement the repository in `src/infrastructure/persistence/sequelize/repositories/`
5. Create service interfaces and implementations
6. Add controllers and routes
7. Add validation schemas
8. Update API documentation
9. Write tests for all components

### Adding a New Endpoint

1. Add the route to the appropriate router file
2. Create/update the controller method
3. Implement any needed service methods
4. Add input validation
5. Update API documentation
6. Write tests (unit, integration, end-to-end)

## Troubleshooting

### Common Issues

1. **Database connection issues**
   - Check your `.env` configuration
   - Ensure PostgreSQL is running
   - Try `npm run db:reset` to reset the database

2. **Type errors**
   - Run `npm run typecheck` to see all type errors
   - Check for missing type definitions

3. **Test failures**
   - Use `npm test -- --verbose` to see detailed error messages
   - Check for incorrect mocks or stubs

4. **JWT issues**
   - Verify the JWT secret is set correctly in `.env`
   - Check token expiration settings

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) 
