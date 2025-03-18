import { User, UserType } from '../models/user.model';
import { UserAttributes, UserCreationAttributes } from '../types/common';

/**
 * User Repository for database operations
 */
class UserRepository {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<UserAttributes | null>} User object
   */
  async findByEmail(email: string): Promise<UserAttributes | null> {
    return await User.findOne({ where: { email } });
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<UserAttributes | null>} User object
   */
  async findById(id: string): Promise<UserAttributes | null> {
    return await User.findByPk(id);
  }

  /**
   * Find user by CPF
   * @param {string} cpf - User CPF
   * @returns {Promise<UserAttributes | null>} User object
   */
  async findByCpf(cpf: string): Promise<UserAttributes | null> {
    return await User.findOne({ where: { cpf } });
  }

  /**
   * Create a new user
   * @param {UserCreationAttributes} userData - User data
   * @returns {Promise<UserAttributes>} Created user
   */
  async create(userData: UserCreationAttributes): Promise<UserAttributes> {
    return await User.create(userData);
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Partial<UserCreationAttributes>} userData - User data to update
   * @returns {Promise<UserAttributes | null>} Updated user
   */
  async update(
    id: string,
    userData: Partial<UserCreationAttributes>
  ): Promise<UserAttributes | null> {
    const [updated] = await User.update(userData, {
      where: { id },
      returning: true,
    });
    
    if (updated) {
      return await this.findById(id);
    }
    
    return null;
  }

  /**
   * Deactivate user (soft delete)
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deactivate(id: string): Promise<boolean> {
    const [updated] = await User.update(
      { active: false },
      { where: { id } }
    );
    
    return updated > 0;
  }

  /**
   * Get all students for a trainer
   * @param {string} trainerId - Trainer ID
   * @returns {Promise<UserAttributes[]>} List of students
   */
  async getStudentsByTrainerId(trainerId: string): Promise<UserAttributes[]> {
    return await User.findAll({
      where: {
        trainerId,
        userType: UserType.STUDENT,
        active: true,
      },
    });
  }

  /**
   * Get all users by type
   * @param {UserType} userType - User type
   * @returns {Promise<UserAttributes[]>} List of users
   */
  async getAllByType(userType: UserType): Promise<UserAttributes[]> {
    return await User.findAll({
      where: {
        userType,
        active: true,
      },
    });
  }

  /**
   * Check if user is an admin
   * @param {string} id - User ID 
   * @returns {Promise<boolean>} Is admin status
   */
  async isAdmin(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return Boolean(user && user.userType === UserType.ADMIN);
  }
}

export default new UserRepository(); 