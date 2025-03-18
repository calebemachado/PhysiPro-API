import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { User, UserType } from '../../../../domain/entities/user';
import { UserFilters } from '../../../../domain/repositories/user.repository.interface';
import { UserModel } from '../models';
import { NotFoundError } from '../../../../domain/errors/domain-error';

/**
 * Sequelize implementation of the User repository
 */
export class SequelizeUserRepository implements IUserRepository {
  /**
   * Maps a database model to a domain entity
   */
  private toDomainEntity(userModel: UserModel): User {
    return {
      id: userModel.id,
      name: userModel.name,
      email: userModel.email,
      cpf: userModel.cpf,
      password: userModel.password, // Note: In real scenarios, consider not returning this
      userType: userModel.userType,
      active: userModel.active,
      trainerId: userModel.trainerId || undefined,
      resetPasswordToken: userModel.resetPasswordToken || undefined,
      resetPasswordExpires: userModel.resetPasswordExpires || undefined,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt
    };
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    const userModel = await UserModel.findByPk(id);
    return userModel ? this.toDomainEntity(userModel) : null;
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const userModel = await UserModel.findOne({ where: { email } });
    return userModel ? this.toDomainEntity(userModel) : null;
  }

  /**
   * Find a user by CPF
   */
  async findByCpf(cpf: string): Promise<User | null> {
    const userModel = await UserModel.findOne({ where: { cpf } });
    return userModel ? this.toDomainEntity(userModel) : null;
  }

  /**
   * Find a user by reset token
   */
  async findByResetToken(token: string): Promise<User | null> {
    const userModel = await UserModel.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });
    return userModel ? this.toDomainEntity(userModel) : null;
  }

  /**
   * Create a new user
   */
  async create(user: User): Promise<User> {
    // Ensure new users get a fresh UUID if not provided
    const userData = {
      ...user,
      id: user.id || uuidv4()
    };

    const userModel = await UserModel.create(userData);
    return this.toDomainEntity(userModel);
  }

  /**
   * Update an existing user
   */
  async update(user: User): Promise<User> {
    const userModel = await UserModel.findByPk(user.id);

    if (!userModel) {
      throw new NotFoundError(`User with ID ${user.id} not found`);
    }

    await userModel.update(user);
    return this.toDomainEntity(userModel);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    const rowsDeleted = await UserModel.destroy({ where: { id } });
    return rowsDeleted > 0;
  }

  /**
   * Find all users matching filters
   */
  async findAll(filters?: UserFilters): Promise<User[]> {
    const whereClause: any = {};

    if (filters) {
      if (filters.id) whereClause.id = filters.id;
      if (filters.name) whereClause.name = { [Op.iLike]: `%${filters.name}%` };
      if (filters.email) whereClause.email = { [Op.iLike]: `%${filters.email}%` };
      if (filters.cpf) whereClause.cpf = filters.cpf;
      if (filters.userType) whereClause.userType = filters.userType;
      if (filters.trainerId) whereClause.trainerId = filters.trainerId;
      if (filters.active !== undefined) whereClause.active = filters.active;
    }

    const userModels = await UserModel.findAll({ where: whereClause });
    return userModels.map(model => this.toDomainEntity(model));
  }

  /**
   * Find students by trainer ID
   */
  async findStudentsByTrainerId(trainerId: string): Promise<User[]> {
    const userModels = await UserModel.findAll({
      where: {
        trainerId,
        userType: UserType.STUDENT
      }
    });
    return userModels.map(model => this.toDomainEntity(model));
  }

  /**
   * Find users by user type
   */
  async findByUserType(userType: UserType): Promise<User[]> {
    const userModels = await UserModel.findAll({
      where: { userType }
    });
    return userModels.map(model => this.toDomainEntity(model));
  }

  /**
   * Check if an email exists (optionally excluding a specific user)
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const whereClause: any = { email };

    if (excludeUserId) {
      whereClause.id = { [Op.ne]: excludeUserId };
    }

    const count = await UserModel.count({ where: whereClause });
    return count > 0;
  }

  /**
   * Check if a CPF exists (optionally excluding a specific user)
   */
  async cpfExists(cpf: string, excludeUserId?: string): Promise<boolean> {
    const whereClause: any = { cpf };

    if (excludeUserId) {
      whereClause.id = { [Op.ne]: excludeUserId };
    }

    const count = await UserModel.count({ where: whereClause });
    return count > 0;
  }
}
