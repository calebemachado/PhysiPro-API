# PhysiPro API

A robust API for physical therapy professionals to manage patients, treatment plans, and progress tracking.

## Features

- **User Management**: Registration, authentication, and authorization
- **Role-based Access Control**: Admin, Trainer, and Student roles
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **API Documentation**: Comprehensive API documentation

## Technology Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Testing**: Jest with Supertest
- **Docker**: Containerized development environment

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL (or Docker for containerized DB)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/physipro-api.git
   cd physipro-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   NODE_ENV=development
   PORT=3000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=physipro
   DB_USER=postgres
   DB_PASSWORD=postgres
   
   # JWT Configuration
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h
   
   # Optional: Reset DB on restart (development only)
   DB_RESET=false
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

   Or use the safer development mode that automatically checks and starts the database if needed:
   ```bash
   npm run dev:safe
   ```

### Docker Setup

1. Start the database:
   ```bash
   docker-compose up -d db
   ```

2. Run the application:
   ```bash
   npm run dev
   ```

### Database Setup

For first-time setup, initialize the admin user:
```bash
npm run init:admin
```

## Project Structure

```
src/
├── domain/               # Domain layer - Business rules and entities
│   ├── entities/         # Domain entities
│   ├── repositories/     # Repository interfaces
│   ├── services/         # Service interfaces
│   └── errors/           # Domain-specific errors
├── infrastructure/       # Infrastructure layer - Implementations
│   ├── auth/             # Authentication services
│   ├── persistence/      # Database access
│   │   └── sequelize/    # Sequelize implementation
│   └── web/              # Web layer
│       ├── controllers/  # API controllers
│       ├── middleware/   # Express middleware
│       └── routes/       # API routes
├── config/               # Configuration files
├── types/                # TypeScript declaration files
└── scripts/              # Utility scripts
```

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Logging System

The application uses a robust logging system with the following features:

- **Structured Logging**: All logs are in JSON format for easy parsing and analysis
- **Log Rotation**: Daily log rotation with automatic compression of old logs
- **Log Levels**: Different log levels (debug, info, warn, error) with appropriate filtering
- **Request Logging**: Detailed HTTP request/response logging with timing information
- **Error Tracking**: Comprehensive error logging with stack traces
- **Database Query Logging**: SQL query logging with execution times
- **Security**: Automatic redaction of sensitive information (passwords, tokens, etc.)
- **Log Categories**: Dedicated loggers for different components (API, DB, Auth, App)

Logs are stored in the `logs` directory with the following files:
- `application-%DATE%.log` - All logs (info level and above)
- `error-%DATE%.log` - Error logs only

During development, logs are also output to the console with color coding.

## Development

### Development with Database Auto-start

The `dev:safe` script provides a convenient way to ensure your development database is running:

```bash
npm run dev:safe
```

This script:
- Checks if the database is running
- Starts it using Docker if it's not available
- Preserves database data between restarts (using Docker volumes)
- Automatically starts the development server once the database is ready

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - calebe@clsax.tech

Project Link: [https://github.com/your-username/physipro-api](https://github.com/your-username/physipro-api)
