import { v4 as uuidv4 } from 'uuid';
import { User, UserType, isValidEmail, isValidCpf, isStrongPassword } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import {
  ValidationError,
  UserNotFoundError,
  EmailAlreadyExistsError,
  CpfAlreadyExistsError
} from '../../domain/errors/domain-error';

/**
 * User service class
 * Contains business logic for user management
 */
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Map domain user to user response DTO
   */
  private toUserResponseDto(user: User): UserResponseDto {
    const { password, resetPasswordToken, resetPasswordExpires, ...userDto } = user;
    return userDto as UserResponseDto;
  }

  /**
   * Get all users
   */
  async getAllUsers(filters?: { name?: string; userType?: UserType; active?: boolean }): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll(filters);
    return users.map(this.toUserResponseDto);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return this.toUserResponseDto(user);
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    // Validate email format
    if (!isValidEmail(userData.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate CPF format
    if (!isValidCpf(userData.cpf)) {
      throw new ValidationError('Invalid CPF format');
    }

    // Validate password strength
    if (!isStrongPassword(userData.password)) {
      throw new ValidationError('Password must be at least 8 characters and contain letters and numbers');
    }

    // Check if email already exists
    if (await this.userRepository.emailExists(userData.email)) {
      throw new EmailAlreadyExistsError(userData.email);
    }

    // Check if CPF already exists
    if (await this.userRepository.cpfExists(userData.cpf)) {
      throw new CpfAlreadyExistsError(userData.cpf);
    }

    // For student users, validate trainerId
    if (userData.userType === UserType.STUDENT && userData.trainerId) {
      const trainer = await this.userRepository.findById(userData.trainerId);

      if (!trainer) {
        throw new ValidationError('Trainer not found');
      }

      if (trainer.userType !== UserType.TRAINER) {
        throw new ValidationError('The specified trainer ID does not belong to a trainer user');
      }
    }

    // Create user object
    const user: User = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      cpf: userData.cpf.replace(/\D/g, ''), // Remove non-digits
      password: userData.password,
      userType: userData.userType,
      active: true,
      trainerId: userData.trainerId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save user to repository
    const savedUser = await this.userRepository.create(user);

    return this.toUserResponseDto(savedUser);
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, userData: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    // Validate email if provided
    if (userData.email && !isValidEmail(userData.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Check if email is unique (excluding current user)
    if (userData.email &&
        userData.email !== existingUser.email &&
        await this.userRepository.emailExists(userData.email, id)) {
      throw new EmailAlreadyExistsError(userData.email);
    }

    // Validate CPF if provided
    if (userData.cpf && !isValidCpf(userData.cpf)) {
      throw new ValidationError('Invalid CPF format');
    }

    // Check if CPF is unique (excluding current user)
    if (userData.cpf &&
        userData.cpf !== existingUser.cpf &&
        await this.userRepository.cpfExists(userData.cpf, id)) {
      throw new CpfAlreadyExistsError(userData.cpf);
    }

    // Validate password if provided
    if (userData.password && !isStrongPassword(userData.password)) {
      throw new ValidationError('Password must be at least 8 characters and contain letters and numbers');
    }

    // For student users, validate trainerId if provided
    if (userData.trainerId &&
        (existingUser.userType === UserType.STUDENT || userData.userType === UserType.STUDENT)) {
      const trainer = await this.userRepository.findById(userData.trainerId);

      if (!trainer) {
        throw new ValidationError('Trainer not found');
      }

      if (trainer.userType !== UserType.TRAINER) {
        throw new ValidationError('The specified trainer ID does not belong to a trainer user');
      }
    }

    // Update user properties
    const updatedUser: User = {
      ...existingUser,
      name: userData.name ?? existingUser.name,
      email: userData.email ? userData.email.toLowerCase() : existingUser.email,
      cpf: userData.cpf ? userData.cpf.replace(/\D/g, '') : existingUser.cpf,
      password: userData.password ?? existingUser.password,
      userType: userData.userType ?? existingUser.userType,
      active: userData.active ?? existingUser.active,
      trainerId: userData.trainerId ?? existingUser.trainerId,
      updatedAt: new Date()
    };

    // Save updated user
    const savedUser = await this.userRepository.update(updatedUser);

    return this.toUserResponseDto(savedUser);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    // Check if user has students (if user is a trainer)
    if (existingUser.userType === UserType.TRAINER) {
      const students = await this.userRepository.findStudentsByTrainerId(id);

      if (students.length > 0) {
        throw new ValidationError('Cannot delete trainer with active students');
      }
    }

    return await this.userRepository.delete(id);
  }

  /**
   * Get students by trainer ID
   */
  async getStudentsByTrainerId(trainerId: string): Promise<UserResponseDto[]> {
    const trainer = await this.userRepository.findById(trainerId);

    if (!trainer) {
      throw new UserNotFoundError(trainerId);
    }

    if (trainer.userType !== UserType.TRAINER) {
      throw new ValidationError('The specified ID does not belong to a trainer');
    }

    const students = await this.userRepository.findStudentsByTrainerId(trainerId);
    return students.map(this.toUserResponseDto);
  }
}
