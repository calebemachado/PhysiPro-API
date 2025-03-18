# PhysiPro API Architecture

This document describes the architectural design of the PhysiPro API, which follows clean architecture principles to ensure the system is maintainable, testable, and adaptable.

## Clean Architecture

The application is structured according to clean architecture principles with the following layers:

1. **Domain Layer** - The core of the application containing business entities and rules
2. **Application Layer** - Contains use cases that orchestrate the flow of data and business rules
3. **Infrastructure Layer** - Implements interfaces defined in the domain layer
4. **Interface Layer** - Handles interaction with external systems (HTTP, CLI, etc.)

### Layer Dependencies

The dependencies between layers follow the Dependency Inversion Principle:

- The domain layer has no dependencies on other layers
- The application layer depends on the domain layer
- The infrastructure layer depends on the domain and application layers
- The interface layer depends on the application layer

## Directory Structure

```
src/
├── domain/             # Domain Layer
│   ├── entities/       # Business entities
│   ├── repositories/   # Repository interfaces
│   ├── services/       # Service interfaces
│   └── errors/         # Domain-specific errors
│
├── application/        # Application Layer
│   ├── services/       # Use case implementations
│   ├── dtos/           # Data Transfer Objects
│   └── validation/     # Input validation logic
│
├── infrastructure/     # Infrastructure Layer
│   ├── persistence/    # Data persistence implementations
│   │   └── sequelize/  # Sequelize ORM implementation
│   └── auth/           # Authentication implementations
│
├── interfaces/         # Interface Layer
│   └── http/           # HTTP API
│       ├── controllers/# Request handlers
│       ├── middleware/ # HTTP middleware
│       ├── routes/     # API routes
│       └── adapters/   # Adapters between HTTP and app layer
│
└── scripts/            # Utility scripts
```

## Diagrams

The `diagrams` directory contains sequence and component diagrams that illustrate the system's behavior and structure.

- [Component Diagram](./diagrams/component-diagram.md)
- [Sequence Diagrams](./diagrams/sequence-diagrams.md)

## Design Patterns

The application uses several design patterns:

- **Repository Pattern** - For data access abstraction
- **Dependency Injection** - For loose coupling between components
- **DTO (Data Transfer Object)** - For data passing between layers
- **Adapter Pattern** - To convert between different interfaces
- **Factory Pattern** - For creating complex objects 
