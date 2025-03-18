# PhysiPro API

A RESTful API for the PhysiPro application, providing role-based access control and features for physical therapy professionals and their clients.

## Features

- User authentication with JWT
- Role-based access control (Admin, Trainer, Student)
- Secure password handling with bcrypt
- PostgreSQL database with Sequelize ORM
- API documentation with Swagger
- Email notifications
- TypeScript for type safety
- Docker support for development

## Requirements

- Node.js (v16+)
- npm or yarn
- PostgreSQL
- Docker (optional)

## Setup

### Environment Variables

Copy the sample environment file and update the values:

```bash
cp .env.sample .env
```

### Database Setup

Option 1: Using Docker (recommended for development):

```bash
npm run docker:start
```

Option 2: Manual PostgreSQL setup:
1. Install PostgreSQL
2. Create a database named `physipro`
3. Update the .env file with your database credentials

### Installation

Install dependencies:

```bash
npm install
```

### Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

### Create Admin User

Create an initial admin user:

```bash
npm run init:admin
```

Initial credentials:
- Email: admin@physipro.com
- Password: admin123456

**Important**: Change this password after the first login!

## API Documentation

After starting the server, access the API documentation at:

```
http://localhost:3000/api-docs
```

## Available Scripts

- `npm run dev`: Start the server in development mode
- `npm run build`: Build the project
- `npm start`: Start the server in production mode
- `npm test`: Run tests
- `npm run lint`: Run linting
- `npm run format`: Format code with Prettier
- `npm run docker:start`: Start PostgreSQL database with Docker
- `npm run docker:stop`: Stop the Docker containers
- `npm run docker:logs`: View database logs
- `npm run init:admin`: Initialize admin user
- `npm run typecheck`: Check TypeScript types

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Database models
├── routes/         # API routes
├── scripts/        # Utility scripts
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── app.ts          # Express application
└── server.ts       # Server entry point
```

## License

[MIT](LICENSE) 