import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { User } from '../models/user.model';
import { UserType } from '../types/model';
import { AppError } from '../utils/app-error';
import bcrypt from 'bcryptjs';

/**
 * Get all users
 * @route GET /api/users
 * @access Admin only
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get query parameters for filtering
    const { name, email, userType, trainerId, active } = req.query;

    // Build where clause
    const whereClause: any = {};

    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` };
    }

    if (email) {
      whereClause.email = { [Op.iLike]: `%${email}%` };
    }

    if (userType) {
      whereClause.userType = userType;
    }

    if (trainerId) {
      whereClause.trainerId = trainerId;
    }

    if (active !== undefined) {
      whereClause.active = active === 'true';
    }

    // Find all users matching criteria
    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Admin, the user themselves, or trainer for their students
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check permissions (handled by middleware canAccessUser)

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * @route POST /api/users
 * @access Admin only
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, cpf, userType, trainerId, active = true } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new AppError('Email already in use', 400);
    }

    // Check if CPF already exists
    const existingCpf = await User.findOne({ where: { cpf } });
    if (existingCpf) {
      throw new AppError('CPF already registered', 400);
    }

    // Verify trainer exists if trainerId is provided
    if (trainerId) {
      const trainer = await User.findByPk(trainerId);
      if (!trainer) {
        throw new AppError('Trainer not found', 404);
      }

      if (trainer.userType !== UserType.TRAINER) {
        throw new AppError('The specified user is not a trainer', 400);
      }
    }

    // Check user type permissions
    if (!User.canRegisterUserType(req.user?.userType as UserType, userType as UserType)) {
      throw new AppError(`You don't have permission to create a ${userType} user`, 403);
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      cpf,
      userType,
      trainerId: trainerId || null,
      active,
    });

    // Format user for response
    const formattedUser = User.formatForResponse(newUser);

    res.status(201).json(formattedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user
 * @route PUT /api/users/:id
 * @access Admin, or trainer for their students
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, cpf, userType, trainerId, active } = req.body;

    // Find user to update
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check permissions (handled by middleware)

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Check if CPF is being changed and already exists
    if (cpf && cpf !== user.cpf) {
      const existingCpf = await User.findOne({ where: { cpf } });
      if (existingCpf) {
        throw new AppError('CPF already registered', 400);
      }
    }

    // Verify trainer exists if trainerId is provided
    if (trainerId && trainerId !== user.trainerId) {
      const trainer = await User.findByPk(trainerId);
      if (!trainer) {
        throw new AppError('Trainer not found', 404);
      }

      if (trainer.userType !== UserType.TRAINER) {
        throw new AppError('The specified user is not a trainer', 400);
      }
    }

    // Check if user type is being changed and requester has permission
    if (userType && userType !== user.userType) {
      if (!User.canRegisterUserType(req.user?.userType as UserType, userType as UserType)) {
        throw new AppError(`You don't have permission to change user type to ${userType}`, 403);
      }
    }

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      cpf: cpf || user.cpf,
      userType: userType || user.userType,
      trainerId: trainerId !== undefined ? trainerId : user.trainerId,
      active: active !== undefined ? active : user.active,
    });

    // Format user for response
    const formattedUser = User.formatForResponse(user);

    res.status(200).json(formattedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user
 * @route DELETE /api/users/:id
 * @access Admin only
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Find user to delete
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check permissions (handled by middleware)

    // Delete user
    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Authenticated user
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // User should be attached to request by auth middleware
    if (!req.user || !req.user.id) {
      throw new AppError('Not authenticated', 401);
    }

    // Find user by ID from request
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Format user for response
    const formattedUser = User.formatForResponse(user);

    res.status(200).json(formattedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * @route PUT /api/users/profile
 * @access Authenticated user
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // User should be attached to request by auth middleware
    if (!req.user || !req.user.id) {
      throw new AppError('Not authenticated', 401);
    }

    const { name, email, password, currentPassword } = req.body;

    // Find user by ID from request
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update object for user
    const updates: any = {};

    if (name) {
      updates.name = name;
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw new AppError('Email already in use', 400);
      }
      updates.email = email;
    }

    // If password is being updated, verify current password
    if (password) {
      if (!currentPassword) {
        throw new AppError('Current password is required to update password', 400);
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AppError('Current password is incorrect', 401);
      }

      updates.password = password;
    }

    // Update user if there are changes
    if (Object.keys(updates).length > 0) {
      await user.update(updates);
    }

    // Format user for response
    const formattedUser = User.formatForResponse(user);

    res.status(200).json(formattedUser);
  } catch (error) {
    next(error);
  }
};