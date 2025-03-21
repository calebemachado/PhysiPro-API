import { IUserService } from '../../../../domain/services/user.service.interface';
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserProfileDTO,
  UserType,
  toUserProfile
} from '../../../../domain/entities/user';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { UserFilters } from '../../../../domain/repositories/user.repository.interface';
import {
  UserNotFoundError,
  EmailAlreadyExistsError,
  CpfAlreadyExistsError
} from '../../../../domain/errors/domain-error';

/**
 * User service implementation
 */
export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<UserProfileDTO | null> {
    const user = await this.userRepository.findById(id);
    return user ? toUserProfile(user) : null;
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserDTO): Promise<UserProfileDTO> {
    // Check if email already exists
    if (await this.userRepository.emailExists(userData.email)) {
      throw new EmailAlreadyExistsError(userData.email);
    }

    // Check if CPF already exists
    if (await this.userRepository.cpfExists(userData.cpf)) {
      throw new CpfAlreadyExistsError(userData.cpf);
    }

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      id: '',  // Will be generated by the repository
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);

    return toUserProfile(user);
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: UpdateUserDTO): Promise<UserProfileDTO> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    // Check if email is being changed and if it already exists
    if (userData.email && userData.email !== existingUser.email) {
      if (await this.userRepository.emailExists(userData.email, id)) {
        throw new EmailAlreadyExistsError(userData.email);
      }
    }

    // Check if CPF is being changed and if it already exists
    if (userData.cpf && userData.cpf !== existingUser.cpf) {
      if (await this.userRepository.cpfExists(userData.cpf, id)) {
        throw new CpfAlreadyExistsError(userData.cpf);
      }
    }

    // Update user
    const updatedUser = await this.userRepository.update({
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    });

    return toUserProfile(updatedUser);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<boolean> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    return this.userRepository.delete(id);
  }

  /**
   * Find all users matching filters
   */
  async findUsers(filters?: UserFilters): Promise<UserProfileDTO[]> {
    const users = await this.userRepository.findAll(filters);
    return users.map(user => toUserProfile(user));
  }

  /**
   * Find students for a specific trainer
   */
  async findStudentsByTrainerId(trainerId: string): Promise<UserProfileDTO[]> {
    const users = await this.userRepository.findStudentsByTrainerId(trainerId);
    return users.map(user => toUserProfile(user));
  }

  /**
   * Find users by user type
   */
  async findUsersByType(userType: UserType): Promise<UserProfileDTO[]> {
    const users = await this.userRepository.findByUserType(userType);
    return users.map(user => toUserProfile(user));
  }

  /**
   * Check if email is already registered
   */
  async isEmailRegistered(email: string, excludeUserId?: string): Promise<boolean> {
    return this.userRepository.emailExists(email, excludeUserId);
  }

  /**
   * Check if CPF is already registered
   */
  async isCpfRegistered(cpf: string, excludeUserId?: string): Promise<boolean> {
    return this.userRepository.cpfExists(cpf, excludeUserId);
  }
}
