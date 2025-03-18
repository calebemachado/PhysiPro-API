# Authentication API

This document describes the authentication-related endpoints of the PhysiPro API.

## Login

Authenticates a user and returns a JWT token.

### Request

```
POST /api/auth/login
```

#### Headers

```
Content-Type: application/json
```

#### Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

#### 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "user@example.com",
    "cpf": "12345678901",
    "userType": "STUDENT",
    "active": true,
    "trainerId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

## Request Password Reset

Initiates the password reset process by sending a reset token to the user's email.

### Request

```
POST /api/auth/reset-password
```

#### Headers

```
Content-Type: application/json
```

#### Body

```json
{
  "email": "user@example.com"
}
```

### Response

#### 200 OK

```json
{
  "message": "If the email exists, a password reset link has been sent to it"
}
```

*Note: For security reasons, this endpoint always returns a 200 OK response, even if the email doesn't exist.*

## Confirm Password Reset

Completes the password reset process using the token received by email.

### Request

```
POST /api/auth/reset-password/confirm
```

#### Headers

```
Content-Type: application/json
```

#### Body

```json
{
  "token": "reset-token-from-email",
  "password": "new-password123"
}
```

### Response

#### 200 OK

```json
{
  "message": "Password reset successful"
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Invalid or expired reset token",
  "code": "INVALID_RESET_TOKEN"
}
```

## Change Password

Changes the authenticated user's password.

### Request

```
POST /api/auth/change-password
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Body

```json
{
  "currentPassword": "current-password123",
  "newPassword": "new-password123"
}
```

### Response

#### 200 OK

```json
{
  "message": "Password changed successfully"
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

## Get Current User

Returns the profile of the authenticated user.

### Request

```
GET /api/auth/me
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
  "email": "user@example.com",
  "cpf": "12345678901",
  "userType": "STUDENT",
  "active": true,
  "trainerId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Not authenticated",
  "code": "UNAUTHORIZED"
}
``` 
