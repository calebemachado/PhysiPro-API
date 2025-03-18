# Sequence Diagrams

This document contains sequence diagrams that illustrate the key flows in the PhysiPro API.

## Authentication Flows

### User Login

This sequence diagram shows the flow of a user logging into the system:

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController
    participant Service as AuthService
    participant Repository as UserRepository
    participant Database as Database
    participant Entity as User Entity
    participant JWT as JWT Service

    Client->>Controller: POST /api/auth/login {email, password}
    
    Controller->>Service: login(credentials)
    
    Service->>Repository: findByEmail(email)
    Repository->>Database: SELECT * FROM users WHERE email = ?
    Database-->>Repository: User data
    Repository-->>Service: User entity or null
    
    alt User not found
        Service-->>Controller: throw InvalidCredentialsError
        Controller-->>Client: 401 Unauthorized
    else User found
        Service->>Entity: Compare passwords
        
        alt Invalid password
            Service-->>Controller: throw InvalidCredentialsError
            Controller-->>Client: 401 Unauthorized
        else Valid password
            Service->>JWT: generateToken(user)
            JWT-->>Service: JWT token
            
            Service->>Entity: toUserProfile(user)
            Entity-->>Service: UserProfileDTO
            
            Service-->>Controller: {token, user: UserProfileDTO}
            Controller-->>Client: 200 OK {token, user}
        end
    end
```

### Password Reset Request

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController
    participant Service as AuthService
    participant Repository as UserRepository
    participant Database as Database
    participant Email as Email Service

    Client->>Controller: POST /api/auth/reset-password {email}
    
    Controller->>Service: requestPasswordReset(email)
    
    Service->>Repository: findByEmail(email)
    Repository->>Database: SELECT * FROM users WHERE email = ?
    Database-->>Repository: User data
    Repository-->>Service: User entity or null
    
    alt User not found
        Service-->>Controller: Return success (security best practice)
        Controller-->>Client: 200 OK
    else User found
        Service->>Service: Generate reset token
        Service->>Repository: update(user with reset token)
        Repository->>Database: UPDATE users SET resetToken = ?, resetExpires = ?
        Database-->>Repository: Success
        Repository-->>Service: Updated user
        
        Service->>Email: sendResetEmail(email, token)
        Email-->>Service: Email sent
        
        Service-->>Controller: Success
        Controller-->>Client: 200 OK
    end
```

### Password Reset Confirmation

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController
    participant Service as AuthService
    participant Repository as UserRepository
    participant Database as Database

    Client->>Controller: POST /api/auth/reset-password/confirm {token, password}
    
    Controller->>Service: confirmPasswordReset(token, password)
    
    Service->>Repository: findByResetToken(token)
    Repository->>Database: SELECT * FROM users WHERE resetToken = ? AND resetExpires > NOW()
    Database-->>Repository: User data
    Repository-->>Service: User entity or null
    
    alt Invalid token
        Service-->>Controller: throw InvalidResetTokenError
        Controller-->>Client: 401 Unauthorized
    else Valid token
        Service->>Service: Hash new password
        Service->>Repository: update(user with new password, clear token)
        Repository->>Database: UPDATE users SET password = ?, resetToken = NULL
        Database-->>Repository: Success
        Repository-->>Service: Updated user
        
        Service-->>Controller: Success
        Controller-->>Client: 200 OK
    end
```

## User Management Flows

### User Registration

```mermaid
sequenceDiagram
    participant Client
    participant Controller as UserController
    participant Service as UserService
    participant Repository as UserRepository
    participant Database as Database
    participant Validator as Validation

    Client->>Controller: POST /api/users {user data}
    
    Controller->>Validator: validate(user data)
    Validator-->>Controller: Validation result
    
    alt Invalid data
        Controller-->>Client: 400 Bad Request
    else Valid data
        Controller->>Service: createUser(userData)
        
        Service->>Repository: emailExists(email)
        Repository->>Database: Check for existing email
        Database-->>Repository: Result
        Repository-->>Service: Boolean
        
        alt Email exists
            Service-->>Controller: throw EmailAlreadyExistsError
            Controller-->>Client: 409 Conflict
        else Email available
            Service->>Repository: cpfExists(cpf)
            Repository->>Database: Check for existing CPF
            Database-->>Repository: Result
            Repository-->>Service: Boolean
            
            alt CPF exists
                Service-->>Controller: throw CpfAlreadyExistsError
                Controller-->>Client: 409 Conflict
            else CPF available
                Service->>Service: Hash password
                Service->>Repository: create(user)
                Repository->>Database: INSERT INTO users
                Database-->>Repository: Created user
                Repository-->>Service: User entity
                
                Service-->>Controller: UserDTO
                Controller-->>Client: 201 Created {user}
            end
        end
    end
```

### Get User Profile

```mermaid
sequenceDiagram
    participant Client
    participant Middleware as AuthMiddleware
    participant Controller as UserController
    participant Service as UserService
    participant Repository as UserRepository
    participant Database as Database

    Client->>Middleware: GET /api/users/:id [with JWT token]
    
    Middleware->>Middleware: Verify JWT token
    
    alt Invalid token
        Middleware-->>Client: 401 Unauthorized
    else Valid token
        Middleware->>Controller: Authenticated request
        
        Controller->>Service: getUserById(id)
        
        Service->>Repository: findById(id)
        Repository->>Database: SELECT * FROM users WHERE id = ?
        Database-->>Repository: User data
        Repository-->>Service: User entity or null
        
        alt User not found
            Service-->>Controller: throw UserNotFoundError
            Controller-->>Client: 404 Not Found
        else User found
            Service-->>Controller: UserDTO
            Controller-->>Client: 200 OK {user}
        end
    end
```

### Update User

```mermaid
sequenceDiagram
    participant Client
    participant Middleware as AuthMiddleware
    participant Controller as UserController
    participant Service as UserService
    participant Repository as UserRepository
    participant Database as Database
    participant Validator as Validation

    Client->>Middleware: PUT /api/users/:id {update data} [with JWT token]
    
    Middleware->>Middleware: Verify JWT token
    Middleware->>Middleware: Check authorization
    
    alt Unauthorized
        Middleware-->>Client: 403 Forbidden
    else Authorized
        Middleware->>Controller: Authenticated request
        
        Controller->>Validator: validate(update data)
        Validator-->>Controller: Validation result
        
        alt Invalid data
            Controller-->>Client: 400 Bad Request
        else Valid data
            Controller->>Service: updateUser(id, updateData)
            
            Service->>Repository: findById(id)
            Repository->>Database: SELECT * FROM users WHERE id = ?
            Database-->>Repository: User data
            Repository-->>Service: User entity or null
            
            alt User not found
                Service-->>Controller: throw UserNotFoundError
                Controller-->>Client: 404 Not Found
            else User found
                alt Email changed
                    Service->>Repository: emailExists(newEmail)
                    Repository-->>Service: Boolean
                    
                    alt Email exists
                        Service-->>Controller: throw EmailAlreadyExistsError
                        Controller-->>Client: 409 Conflict
                    end
                end
                
                alt CPF changed
                    Service->>Repository: cpfExists(newCpf)
                    Repository-->>Service: Boolean
                    
                    alt CPF exists
                        Service-->>Controller: throw CpfAlreadyExistsError
                        Controller-->>Client: 409 Conflict
                    end
                end
                
                Service->>Repository: update(user)
                Repository->>Database: UPDATE users SET ...
                Database-->>Repository: Updated user
                Repository-->>Service: User entity
                
                Service-->>Controller: UserDTO
                Controller-->>Client: 200 OK {user}
            end
        end
    end
```

### Delete User

```mermaid
sequenceDiagram
    participant Client
    participant Middleware as AuthMiddleware
    participant Controller as UserController
    participant Service as UserService
    participant Repository as UserRepository
    participant Database as Database

    Client->>Middleware: DELETE /api/users/:id [with JWT token]
    
    Middleware->>Middleware: Verify JWT token
    Middleware->>Middleware: Check authorization (admin only)
    
    alt Unauthorized
        Middleware-->>Client: 403 Forbidden
    else Authorized
        Middleware->>Controller: Authenticated request
        
        Controller->>Service: deleteUser(id)
        
        Service->>Repository: findById(id)
        Repository->>Database: SELECT * FROM users WHERE id = ?
        Database-->>Repository: User data
        Repository-->>Service: User entity or null
        
        alt User not found
            Service-->>Controller: throw UserNotFoundError
            Controller-->>Client: 404 Not Found
        else User found
            Service->>Repository: delete(id)
            Repository->>Database: DELETE FROM users WHERE id = ?
            Database-->>Repository: Result
            Repository-->>Service: Success
            
            Service-->>Controller: Success
            Controller-->>Client: 204 No Content
        end
    end
```

## Search and Filtering Flows

### List Users with Filtering

```mermaid
sequenceDiagram
    participant Client
    participant Middleware as AuthMiddleware
    participant Controller as UserController
    participant Service as UserService
    participant Repository as UserRepository
    participant Database as Database

    Client->>Middleware: GET /api/users?userType=STUDENT&active=true [with JWT token]
    
    Middleware->>Middleware: Verify JWT token
    Middleware->>Middleware: Check authorization
    
    alt Unauthorized
        Middleware-->>Client: 403 Forbidden
    else Authorized
        Middleware->>Controller: Authenticated request with query parameters
        
        Controller->>Service: findUsers(filters)
        
        Service->>Repository: findAll(filters)
        Repository->>Database: SELECT * FROM users WHERE userType = ? AND active = ?
        Database-->>Repository: User data list
        Repository-->>Service: User entities
        
        Service->>Service: Map to UserDTOs
        
        Service-->>Controller: UserDTO[]
        Controller-->>Client: 200 OK {users: [...]}
    end
```

### Find Students by Trainer

```mermaid
sequenceDiagram
    participant Client
    participant Middleware as AuthMiddleware
    participant Controller as UserController
    participant Service as UserService
    participant Repository as UserRepository
    participant Database as Database

    Client->>Middleware: GET /api/users/trainer/:trainerId/students [with JWT token]
    
    Middleware->>Middleware: Verify JWT token
    Middleware->>Middleware: Check authorization
    
    alt Unauthorized
        Middleware-->>Client: 403 Forbidden
    else Authorized
        Middleware->>Controller: Authenticated request
        
        Controller->>Service: findStudentsByTrainer(trainerId)
        
        Service->>Repository: findStudentsByTrainerId(trainerId)
        Repository->>Database: SELECT * FROM users WHERE trainerId = ? AND userType = 'STUDENT'
        Database-->>Repository: Students data
        Repository-->>Service: Student entities
        
        Service->>Service: Map to UserDTOs
        
        Service-->>Controller: UserDTO[]
        Controller-->>Client: 200 OK {students: [...]}
    end
```
