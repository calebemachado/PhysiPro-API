import { UserService } from '../../../../application/services/user.service';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { User, UserType } from '../../../../domain/entities/user';
import { UserNotFoundError, EmailAlreadyExistsError, CpfAlreadyExistsError, NotFoundError, ConflictError } from '../../../../domain/errors/domain-error';

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

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockUserRepository);
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(mockUser.id);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        cpf: mockUser.cpf,
        userType: mockUser.userType,
        active: mockUser.active,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      });
    });

    it('should throw UserNotFoundError when user is not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById('nonexistent-id'))
        .rejects.toThrow(NotFoundError);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('createUser', () => {
    const createUserDto = {
      name: 'New User',
      email: 'new@example.com',
      cpf: '12345678901',
      password: 'Password123',
      userType: UserType.STUDENT
    };

    it('should create a user successfully', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.cpfExists.mockResolvedValue(false);
      mockUserRepository.create.mockImplementation(async (user) => user);

      // Act
      const result = await userService.createUser(createUserDto);

      // Assert
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.cpfExists).toHaveBeenCalledWith(createUserDto.cpf);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.cpf).toBe(createUserDto.cpf);
      expect(result.userType).toBe(createUserDto.userType);
      expect(result.active).toBe(true);
    });

    it('should throw EmailAlreadyExistsError when email exists', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.createUser(createUserDto))
        .rejects.toThrow(ConflictError);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw CpfAlreadyExistsError when CPF exists', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.cpfExists.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.createUser(createUserDto))
        .rejects.toThrow(ConflictError);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.cpfExists).toHaveBeenCalledWith(createUserDto.cpf);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
