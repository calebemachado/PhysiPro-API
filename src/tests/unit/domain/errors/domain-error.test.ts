import {
  DomainError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  UserNotFoundError,
  EmailAlreadyExistsError
} from '../../../../domain/errors/domain-error';

describe('Domain Errors', () => {
  describe('DomainError', () => {
    it('should create a base domain error with default status code', () => {
      const error = new DomainError('Base error message');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Base error message');
      expect(error.statusCode).toBe(400); // Default status code
      expect(error.name).toBe('DomainError');
    });

    it('should create a base domain error with custom status code', () => {
      const error = new DomainError('Base error message', 418);

      expect(error.message).toBe('Base error message');
      expect(error.statusCode).toBe(418);
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with 400 status code', () => {
      const error = new ValidationError('Invalid data');

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Invalid data');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with 404 status code', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an unauthorized error with 401 status code', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create an unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Custom unauthorized message');

      expect(error.message).toBe('Custom unauthorized message');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create a forbidden error with 403 status code', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Forbidden: Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('ForbiddenError');
    });
  });

  describe('ConflictError', () => {
    it('should create a conflict error with 409 status code', () => {
      const error = new ConflictError('Resource already exists');

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('UserNotFoundError', () => {
    it('should create a user not found error with default message', () => {
      const error = new UserNotFoundError();

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('UserNotFoundError');
    });

    it('should create a user not found error with user ID in message', () => {
      const error = new UserNotFoundError('123');

      expect(error.message).toBe('User with ID 123 not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('EmailAlreadyExistsError', () => {
    it('should create an email already exists error', () => {
      const error = new EmailAlreadyExistsError('test@example.com');

      expect(error).toBeInstanceOf(ConflictError);
      expect(error.message).toBe('Email test@example.com is already in use');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('EmailAlreadyExistsError');
    });
  });
});
