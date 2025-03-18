# Users API

This document describes the user-related endpoints of the PhysiPro API.

## Create User

Creates a new user in the system.

### Request

```
POST /api/users
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer <token> (admin only)
```

#### Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cpf": "12345678901",
  "password": "Password123",
  "userType": "STUDENT",
  "trainerId": "123e4567-e89b-12d3-a456-426614174001" // Optional, for students only
}
```

### Response

#### 201 Created

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cpf": "12345678901",
  "userType": "STUDENT",
  "active": true,
  "trainerId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### 400 Bad Request

```json
{
  "status": "error",
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters and contain letters and numbers"
  }
}
```

#### 409 Conflict

```json
{
  "status": "error",
  "message": "Email john.doe@example.com is already in use",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

## Get User

Retrieves a specific user by ID.

### Request

```
GET /api/users/:id
```

#### Headers

```
Authorization: Bearer <token>
```

### Response

#### 200 OK

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cpf": "12345678901",
  "userType": "STUDENT",
  "active": true,
  "trainerId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "message": "User with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "code": "USER_NOT_FOUND"
}
```

## Update User

Updates a user's information.

### Request

```
PUT /api/users/:id
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Body

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "active": true,
  "trainerId": "123e4567-e89b-12d3-a456-426614174002"
}
```

### Response

#### 200 OK

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "cpf": "12345678901",
  "userType": "STUDENT",
  "active": true,
  "trainerId": "123e4567-e89b-12d3-a456-426614174002",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T12:34:56.789Z"
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "message": "User with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "code": "USER_NOT_FOUND"
}
```

#### 409 Conflict

```json
{
  "status": "error",
  "message": "Email john.updated@example.com is already in use",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

## Delete User

Deletes a user from the system.

### Request

```
DELETE /api/users/:id
```

#### Headers

```
Authorization: Bearer <token> (admin only)
```

### Response

#### 204 No Content

No body returned.

#### 404 Not Found

```json
{
  "status": "error",
  "message": "User with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "code": "USER_NOT_FOUND"
}
```

## List Users

Retrieves a list of users, with optional filtering.

### Request

```
GET /api/users?userType=STUDENT&active=true
```

#### Headers

```
Authorization: Bearer <token>
```

#### Query Parameters

- `userType`: Filter by user type (ADMIN, TRAINER, STUDENT)
- `active`: Filter by active status (true, false)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of users per page (default: 10)

### Response

#### 200 OK

```json
{
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "cpf": "12345678901",
      "userType": "STUDENT",
      "active": true,
      "trainerId": "123e4567-e89b-12d3-a456-426614174001",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "cpf": "12345678902",
      "userType": "STUDENT",
      "active": true,
      "trainerId": "123e4567-e89b-12d3-a456-426614174001",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

## Find Students by Trainer

Retrieves all students assigned to a specific trainer.

### Request

```
GET /api/users/trainer/:trainerId/students
```

#### Headers

```
Authorization: Bearer <token>
```

### Response

#### 200 OK

```json
{
  "students": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "cpf": "12345678901",
      "userType": "STUDENT",
      "active": true,
      "trainerId": "123e4567-e89b-12d3-a456-426614174001",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "cpf": "12345678902",
      "userType": "STUDENT",
      "active": true,
      "trainerId": "123e4567-e89b-12d3-a456-426614174001",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "message": "Trainer with ID 123e4567-e89b-12d3-a456-426614174001 not found",
  "code": "USER_NOT_FOUND"
}
``` 
