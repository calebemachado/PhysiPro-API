# PhysiPro API Documentation

This directory contains comprehensive documentation for the PhysiPro API, organized into several sections to help developers understand and work with the system.

## Table of Contents

- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Developer Guides](#developer-guides)

## Architecture

The [architecture](./architecture/README.md) section contains documentation about the system's architectural design, including:

- System overview and design principles
- Clean architecture implementation
- Component diagrams showing system structure
- Sequence diagrams for key flows
- Data models and relationships

## API Reference

The [API reference](./api/README.md) contains detailed documentation for all API endpoints, including:

- Authentication endpoints
- User management API
- Request/response formats
- Error handling and status codes
- API versioning information

## Developer Guides

The [guides](./guides/README.md) section contains practical information for developers working with the codebase, including:

- [Setup Guide](./guides/setup.md) - Environment setup instructions
- [Development Workflow](./guides/development.md) - Day-to-day development process
- [Testing Guide](./guides/testing.md) - How to write and run tests
- [Deployment Guide](./guides/deployment.md) - Deployment procedures
- [Code Standards](./guides/code-standards.md) - Coding conventions and best practices

## Directory Structure

```
docs/
├── README.md                              # Main documentation index
├── api/                                   # API reference documentation
│   ├── README.md                          # API overview
│   ├── authentication.md                  # Authentication endpoints
│   └── users.md                           # User management endpoints
├── architecture/                          # Architecture documentation
│   ├── README.md                          # Architecture overview
│   └── diagrams/                          # Visual representations
│       ├── component-diagram.md           # Component relationships
│       └── sequence-diagrams.md           # Process flows
└── guides/                                # Developer guides
    ├── README.md                          # Guides overview
    ├── setup.md                           # Setup instructions
    ├── development.md                     # Development workflow
    ├── testing.md                         # Testing guide
    ├── deployment.md                      # Deployment guide
    └── code-standards.md                  # Coding standards
```

## Contributing to Documentation

When adding new features or making changes to existing ones, please update the relevant documentation files to keep them in sync with the code. 

- Use Markdown for all documentation files
- Follow the existing structure
- Include code examples where appropriate
- Keep API documentation up to date with endpoints
- Maintain the directory structure shown above 
