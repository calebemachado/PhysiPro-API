# Setup Guide

This guide will help you set up the PhysiPro API development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.x or later) - [Download](https://nodejs.org/)
- **npm** (v7.x or later, comes with Node.js)
- **PostgreSQL** (v12.x or later) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/physipro-api.git
cd physipro-api
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies listed in `package.json`.

## Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Open the `.env` file in your editor and update the values:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=physipro_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Logging Configuration
LOG_LEVEL=debug
```

## Step 4: Set Up the Database

### Create a PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside PostgreSQL CLI
CREATE DATABASE physipro_dev;
\q
```

### Run Migrations

```bash
npm run db:migrate
```

### Seed the Database (Optional)

This will populate your database with sample data for development:

```bash
npm run db:seed
```

## Step 5: Start the Development Server

```bash
npm run dev
```

The API server should now be running at `http://localhost:3000`.

## Step 6: Verify the Setup

### API Documentation

Open `http://localhost:3000/api-docs` in your browser to access the Swagger API documentation.

### Test the API

You can test the API using:

```bash
# Run the unit tests
npm test

# Ping the API to verify it's running
curl http://localhost:3000/api/health
```

## Docker Setup (Alternative)

If you prefer to use Docker, we provide a Docker Compose configuration:

```bash
# Start the application with Docker Compose
docker-compose up -d

# Run migrations in the Docker environment
docker-compose exec app npm run db:migrate

# Seed the database in Docker
docker-compose exec app npm run db:seed
```

## Development Scripts

Here are the main scripts available for development:

| Script                | Description                                          |
|-----------------------|------------------------------------------------------|
| `npm run dev`         | Start the development server with hot reloading      |
| `npm run build`       | Build the application for production                 |
| `npm start`           | Start the production server                          |
| `npm test`            | Run tests                                            |
| `npm run test:coverage` | Run tests with coverage report                     |
| `npm run lint`        | Run ESLint to check for code issues                  |
| `npm run lint:fix`    | Automatically fix linting issues where possible      |
| `npm run db:migrate`  | Run database migrations                              |
| `npm run db:seed`     | Seed the database with sample data                   |
| `npm run typecheck`   | Run TypeScript type checking                         |

## IDE Setup

### VS Code

We recommend using Visual Studio Code with the following extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens
- REST Client
- Jest Runner

A workspace configuration file (`.vscode/settings.json`) is included in the repository to automatically configure these extensions with our recommended settings.

### JetBrains IDEs (WebStorm, IntelliJ IDEA)

If you're using a JetBrains IDE:

1. Enable ESLint integration (Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint)
2. Enable Prettier integration (Settings → Languages & Frameworks → JavaScript → Prettier)
3. Configure the TypeScript compiler service (Settings → Languages & Frameworks → TypeScript)

## Troubleshooting Common Issues

### Database Connection Failed

If you're getting database connection errors:

1. Check if PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Verify your database credentials in `.env`

3. Make sure you've created the database:
   ```bash
   psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'physipro_dev'"
   ```

### Node.js Version Issues

If you're having issues with Node.js compatibility:

1. Check your Node.js version:
   ```bash
   node --version
   ```

2. Consider using NVM (Node Version Manager) to install the correct version:
   ```bash
   nvm install 14
   nvm use 14
   ```

### ESLint or TypeScript Errors

If you're seeing a lot of ESLint or TypeScript errors:

1. Try fixing automatic issues:
   ```bash
   npm run lint:fix
   ```

2. Check if your IDE is properly configured for ESLint and TypeScript.

## Next Steps

Once you have set up your development environment, check out the [Development Workflow](./development.md) guide to learn about our development process and best practices. 
