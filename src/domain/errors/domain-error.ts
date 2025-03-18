/**
 * Error codes for domain errors
 */
export enum ErrorCode {
  // General errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',

  // User-specific errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  CPF_ALREADY_EXISTS = 'CPF_ALREADY_EXISTS',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
  RESET_TOKEN_EXPIRED = 'RESET_TOKEN_EXPIRED',
}

/**
 * Base class for all domain-specific errors
 */
export class DomainError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 400,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends DomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 404, ErrorCode.NOT_FOUND, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error for unauthorized access
 */
export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized access', details?: Record<string, any>) {
    super(message, 401, ErrorCode.UNAUTHORIZED, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error for insufficient permissions
 */
export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden: Insufficient permissions', details?: Record<string, any>) {
    super(message, 403, ErrorCode.FORBIDDEN, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Error for conflict in resource state
 */
export class ConflictError extends DomainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 409, ErrorCode.CONFLICT, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * User not found error
 */
export class UserNotFoundError extends NotFoundError {
  constructor(id?: string, details?: Record<string, any>) {
    const message = id ? `User with ID ${id} not found` : 'User not found';
    super(message, details);
  }
}

/**
 * User already exists error
 */
export class UserAlreadyExistsError extends ConflictError {
  constructor(email?: string, cpf?: string, details?: Record<string, any>) {
    const message = 'User already exists';
    super(message, details);
  }
}

/**
 * Email already exists error
 */
export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string, details?: Record<string, any>) {
    super(`Email ${email} is already in use`, details);
  }
}

/**
 * CPF already exists error
 */
export class CpfAlreadyExistsError extends ConflictError {
  constructor(cpf: string, details?: Record<string, any>) {
    super(`CPF ${cpf} is already registered`, details);
  }
}

/**
 * Invalid credentials error
 */
export class InvalidCredentialsError extends UnauthorizedError {
  constructor(details?: Record<string, any>) {
    super('Invalid email or password', details);
  }
}

/**
 * Invalid reset token error
 */
export class InvalidResetTokenError extends UnauthorizedError {
  constructor(details?: Record<string, any>) {
    super('Invalid or expired reset token', details);
  }
}
