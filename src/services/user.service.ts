import userRepository from '../repositories/user.repository';
import { UserAttributes, UserCreationAttributes, UserType } from '../types/common';

/**
 * User Service for business logic
 */
class UserService {
  /**
   * Register a new user
   * @param {UserCreationAttributes} userData - User data
   * @param {UserAttributes | null} currentUser - Current authenticated user
   * @returns {Promise<UserAttributes>} Created user
   */
  async registerUser(
    userData: UserCreationAttributes,
    currentUser: UserAttributes | null = null
  ): Promise<UserAttributes> {
    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    // Check if CPF already exists
    const existingCpf = await userRepository.findByCpf(userData.cpf);
    if (existingCpf) {
      throw new Error('CPF already in use');
    }

    // If registering a student with a trainer, verify trainer exists and is a trainer
    if (userData.userType === UserType.STUDENT && userData.trainerId) {
      const trainer = await userRepository.findById(userData.trainerId);
      if (!trainer || trainer.userType !== UserType.TRAINER) {
        throw new Error('Invalid trainer specified');
      }
    }

    // If current user is a trainer registering a student, set trainerId
    if (
      currentUser?.userType === UserType.TRAINER &&
      userData.userType === UserType.STUDENT
    ) {
      userData.trainerId = currentUser.id;
    }

    // Create the user
    const user = await userRepository.create(userData);
    return user;
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<UserAttributes>} User profile
   */
  async getUserProfile(userId: string): Promise<UserAttributes> {
    const user = await userRepository.findById(userId);
    if (!user || !user.active) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Partial<UserCreationAttributes>} userData - User data to update
   * @param {UserAttributes} currentUser - Current authenticated user
   * @returns {Promise<UserAttributes>} Updated user
   */
  async updateUserProfile(
    userId: string,
    userData: Partial<UserCreationAttributes>,
    currentUser: UserAttributes
  ): Promise<UserAttributes> {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user || !user.active) {
      throw new Error('User not found');
    }

    // Only ADMIN can update user type or other users (unless it's a trainer updating their student)
    if (
      currentUser.id !== userId &&
      currentUser.userType !== UserType.ADMIN &&
      !(
        currentUser.userType === UserType.TRAINER &&
        user.userType === UserType.STUDENT &&
        user.trainerId === currentUser.id
      )
    ) {
      throw new Error('Not authorized to update this user');
    }

    // Don't allow changing userType or trainerId if not admin
    if (currentUser.userType !== UserType.ADMIN) {
      delete userData.userType;
      delete userData.trainerId;
    }

    // Check if email is being changed and is unique
    if (userData.email && userData.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already in use');
      }
    }

    // Check if CPF is being changed and is unique
    if (userData.cpf && userData.cpf !== user.cpf) {
      const existingCpf = await userRepository.findByCpf(userData.cpf);
      if (existingCpf) {
        throw new Error('CPF already in use');
      }
    }

    // Update user
    const updatedUser = await userRepository.update(userId, userData);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    return updatedUser;
  }

  /**
   * Deactivate user
   * @param {string} userId - User ID
   * @param {UserAttributes} currentUser - Current authenticated user
   * @returns {Promise<boolean>} Success status
   */
  async deactivateUser(userId: string, currentUser: UserAttributes): Promise<boolean> {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user || !user.active) {
      throw new Error('User not found');
    }

    // Prevent deleting admin accounts
    if (user.userType === UserType.ADMIN) {
      throw new Error('Admin accounts cannot be deleted');
    }

    // Only ADMIN can delete any user, and TRAINER can only delete their students
    if (
      currentUser.userType !== UserType.ADMIN &&
      !(
        currentUser.userType === UserType.TRAINER &&
        user.userType === UserType.STUDENT &&
        user.trainerId === currentUser.id
      )
    ) {
      throw new Error('Not authorized to delete this user');
    }

    // Deactivate user
    return await userRepository.deactivate(userId);
  }

  /**
   * Get all students for a trainer
   * @param {string} trainerId - Trainer ID
   * @returns {Promise<UserAttributes[]>} List of students
   */
  async getStudentsByTrainer(trainerId: string): Promise<UserAttributes[]> {
    const trainer = await userRepository.findById(trainerId);
    if (!trainer || trainer.userType !== UserType.TRAINER) {
      throw new Error('Invalid trainer specified');
    }

    const students = await userRepository.getStudentsByTrainerId(trainerId);
    return students;
  }

  /**
   * Get all users by type
   * @param {UserType} userType - User type
   * @returns {Promise<UserAttributes[]>} List of users
   */
  async getAllUsersByType(userType: UserType): Promise<UserAttributes[]> {
    // Validate user type
    if (!Object.values(UserType).includes(userType)) {
      throw new Error('Invalid user type specified');
    }

    return await userRepository.getAllByType(userType);
  }
}

export default new UserService(); 