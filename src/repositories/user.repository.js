const { User, UserType } = require('../models/user.model');
const { sequelize } = require('../config/database');

/**
 * User Repository for database operations
 */
class UserRepository {
  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Promise<User>} User object
   */
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  /**
   * Find user by ID
   * @param {String} id - User ID
   * @returns {Promise<User>} User object
   */
  async findById(id) {
    return await User.findByPk(id);
  }

  /**
   * Find user by CPF
   * @param {String} cpf - User CPF
   * @returns {Promise<User>} User object
   */
  async findByCpf(cpf) {
    return await User.findOne({ where: { cpf } });
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>} Created user
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Update user
   * @param {String} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<User>} Updated user
   */
  async update(id, userData) {
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
   * @param {String} id - User ID
   * @returns {Promise<Boolean>} Success status
   */
  async deactivate(id) {
    const [updated] = await User.update(
      { active: false },
      { where: { id } }
    );
    
    return updated > 0;
  }

  /**
   * Get all students for a trainer
   * @param {String} trainerId - Trainer ID
   * @returns {Promise<Array>} List of students
   */
  async getStudentsByTrainerId(trainerId) {
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
   * @param {String} userType - User type
   * @returns {Promise<Array>} List of users
   */
  async getAllByType(userType) {
    return await User.findAll({
      where: {
        userType,
        active: true,
      },
    });
  }

  /**
   * Check if user is an admin
   * @param {String} id - User ID 
   * @returns {Promise<Boolean>} Is admin status
   */
  async isAdmin(id) {
    const user = await this.findById(id);
    return user && user.userType === UserType.ADMIN;
  }
}

module.exports = new UserRepository(); 