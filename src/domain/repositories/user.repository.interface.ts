import { User, UserType } from '../entities/user';

/**
 * User repository interface
 * Defines how the domain layer interacts with the data layer
 * This allows the domain to remain independent of the infrastructure
 */
export interface IUserRepository {
  /**
   * Find a user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by CPF
   */
  findByCpf(cpf: string): Promise<User | null>;

  /**
   * Find a user by reset password token
   */
  findByResetToken(token: string): Promise<User | null>;

  /**
   * Create a new user
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   */
  update(user: User): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get all users
   */
  findAll(filters?: UserFilters): Promise<User[]>;

  /**
   * Get all students for a trainer
   */
  findStudentsByTrainerId(trainerId: string): Promise<User[]>;

  /**
   * Get all users by type
   */
  findByUserType(userType: UserType): Promise<User[]>;

  /**
   * Check if email exists (excluding a specific user ID)
   */
  emailExists(email: string, excludeUserId?: string): Promise<boolean>;

  /**
   * Check if CPF exists (excluding a specific user ID)
   */
  cpfExists(cpf: string, excludeUserId?: string): Promise<boolean>;
}

/**
 * User filters for repository queries
 */
export interface UserFilters {
  id?: string;
  name?: string;
  email?: string;
  cpf?: string;
  userType?: UserType;
  trainerId?: string;
  active?: boolean;
}
