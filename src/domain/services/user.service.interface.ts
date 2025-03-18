import { User, CreateUserDTO, UpdateUserDTO, UserProfileDTO, UserType } from '../entities/user';
import { UserFilters } from '../repositories/user.repository.interface';

/**
 * Interface for user service
 */
export interface IUserService {
  /**
   * Get a user by ID
   */
  getUserById(id: string): Promise<UserProfileDTO | null>;

  /**
   * Create a new user
   */
  createUser(userData: CreateUserDTO): Promise<UserProfileDTO>;

  /**
   * Update an existing user
   */
  updateUser(id: string, userData: UpdateUserDTO): Promise<UserProfileDTO>;

  /**
   * Delete a user
   */
  deleteUser(id: string): Promise<boolean>;

  /**
   * Find all users matching filters
   */
  findUsers(filters?: UserFilters): Promise<UserProfileDTO[]>;

  /**
   * Find students for a specific trainer
   */
  findStudentsByTrainerId(trainerId: string): Promise<UserProfileDTO[]>;

  /**
   * Find users by user type
   */
  findUsersByType(userType: UserType): Promise<UserProfileDTO[]>;

  /**
   * Check if email is already registered
   */
  isEmailRegistered(email: string, excludeUserId?: string): Promise<boolean>;

  /**
   * Check if CPF is already registered
   */
  isCpfRegistered(cpf: string, excludeUserId?: string): Promise<boolean>;
}
