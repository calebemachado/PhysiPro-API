# PhysiPro API Reference

This document provides detailed information about the PhysiPro API endpoints.

## Base URL

The base URL for all API endpoints is:

```
https://api.physipro.com/api
```

For local development:

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

### JWT Authentication

Include the JWT token in the request header:

```
Authorization: Bearer <token>
```

You can obtain a token using the login endpoint.

## Error Handling

The API returns error responses in a consistent format:

```json
{
  "status": "error",
  "message": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field1": "Error for specific field"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

## API Endpoints

For detailed information about each endpoint, refer to the corresponding documentation file:

- [Authentication](./authentication.md)
- [Users](./users.md)

## API Versioning

The API is currently in version 1 and does not require a version prefix in the URL. Future versions will be accessible via `/api/v2`, etc. 
