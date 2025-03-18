# Component Diagram

This document shows the high-level component structure of the PhysiPro API, illustrating how the different layers interact according to the clean architecture principles.

## High-Level Architecture

```mermaid
graph TD
    subgraph "Interface Layer"
        HTTP["HTTP API (Express)"]
        Controllers["Controllers"]
        Routes["Routes"]
        Middleware["Middleware"]
        Validators["Validators"]
    end

    subgraph "Application Layer"
        UseCases["Use Cases/Services"]
        DTOs["Data Transfer Objects"]
    end

    subgraph "Domain Layer"
        Entities["Domain Entities"]
        Interfaces["Repository Interfaces"]
        DomainServices["Domain Services"]
        DomainErrors["Domain Errors"]
    end

    subgraph "Infrastructure Layer"
        Repositories["Repository Implementations"]
        Database["Database (PostgreSQL)"]
        ORM["ORM (Sequelize)"]
        AuthServices["Auth Services (JWT)"]
        External["External Services"]
    end

    %% Interface Layer Dependencies
    HTTP --> Routes
    Routes --> Controllers
    Routes --> Middleware
    Controllers --> UseCases
    Controllers --> Validators
    Middleware --> UseCases

    %% Application Layer Dependencies
    UseCases --> Entities
    UseCases --> Interfaces
    UseCases --> DTOs
    UseCases --> DomainServices
    UseCases --> DomainErrors
    DTOs --> Entities

    %% Domain Layer has no dependencies
    Entities -.-> DomainErrors
    
    %% Infrastructure Layer Dependencies
    Repositories --> Interfaces
    Repositories --> ORM
    ORM --> Database
    AuthServices --> DomainServices
    External --> DomainServices
    
    %% Implementation
    Repositories -.implements.-> Interfaces
    AuthServices -.implements.-> DomainServices
    
    style Entities fill:#f9f,stroke:#333,stroke-width:2px
    style Interfaces fill:#bbf,stroke:#333,stroke-width:2px
    style UseCases fill:#bfb,stroke:#333,stroke-width:2px
    style Controllers fill:#fbb,stroke:#333,stroke-width:2px
```

## Clean Architecture Layers

The component diagram above illustrates how the PhysiPro API is structured according to clean architecture principles:

1. **Interface Layer (Adapters)**: This layer handles HTTP requests and responses, routing, and input validation.
   - Controllers, routes, and middleware interact with the application layer.
   - No direct dependencies on the infrastructure layer.

2. **Application Layer (Use Cases)**: Contains application-specific business rules and orchestrates the flow of data.
   - Services implement use cases by coordinating domain entities and services.
   - Depends only on the domain layer.

3. **Domain Layer (Entities)**: Contains business entities and core business rules.
   - No dependencies on other layers - this is the most stable layer.
   - Defines interfaces for repositories and services.
   - Contains domain-specific errors and validation rules.

4. **Infrastructure Layer (Frameworks)**: Implements interfaces defined in the domain layer.
   - Repository implementations, database access, authentication mechanisms.
   - Adapts external libraries and frameworks to the application.

## Key Components

1. **Controllers**: Handle HTTP requests, delegate to services, and format responses.
2. **Services**: Implement use cases, coordinate entities and repositories.
3. **Repositories**: Access and manipulate data storage.
4. **Entities**: Core business objects with their validation rules.
5. **Middleware**: Handle cross-cutting concerns like authentication and error handling.

## Dependency Flow

The arrows in the diagram represent dependencies, which primarily flow inward (toward the domain layer). This ensures that:

- The domain layer is independent and can be tested in isolation.
- The application layer depends only on the domain layer.
- The interface and infrastructure layers depend on the application and domain layers.
- Lower layers never depend on higher layers.

This design promotes:
- Testability
- Maintainability
- Flexibility to change external tools and frameworks 
