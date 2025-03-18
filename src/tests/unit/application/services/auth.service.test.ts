import { AuthService } from '../../../../application/services/auth.service';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { User, UserType } from '../../../../domain/entities/user';
import { InvalidCredentialsError, UserNotFoundError, InvalidResetTokenError, UnauthorizedError } from '../../../../domain/errors/domain-error';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the external libraries
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked-token')
  })
}));

// Mock implementation of the UserRepository
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByCpf: jest.fn(),
  findByResetToken: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findStudentsByTrainerId: jest.fn(),
  findByUserType: jest.fn(),
  emailExists: jest.fn(),
  cpfExists: jest.fn()
};

// Create a test user object
const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test User',
  email: 'test@example.com',
  cpf: '12345678901',
  password: 'hashedPassword123',
  userType: UserType.STUDENT,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('AuthService', () => {
  let authService: AuthService;
  const TEST_JWT_SECRET = 'test-secret';

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockUserRepository, TEST_JWT_SECRET);
  });

  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'correctPassword' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocked-jwt-token');

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser.id }, TEST_JWT_SECRET, expect.any(Object));
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          cpf: mockUser.cpf,
          userType: mockUser.userType,
          active: mockUser.active,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt
        },
        token: 'mocked-jwt-token'
      });
    });

    it('should throw InvalidCredentialsError when user is not found', async () => {
      // Arrange
      const loginDto = { email: 'nonexistent@example.com', password: 'password' };
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'wrongPassword' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should return user ID when token is valid', () => {
      // Arrange
      (jwt.verify as jest.Mock).mockReturnValue({ id: mockUser.id });

      // Act
      const result = authService.verifyToken('valid-token');

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', TEST_JWT_SECRET);
      expect(result).toBe(mockUser.id);
    });

    it('should throw InvalidCredentialsError when token is invalid', () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => authService.verifyToken('invalid-token'))
        .toThrow(UnauthorizedError);
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', TEST_JWT_SECRET);
    });
  });
});
