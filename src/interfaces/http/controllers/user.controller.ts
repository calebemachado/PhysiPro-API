import { Request, Response, NextFunction } from 'express';
import { userService } from '../../../application/services';
import { CreateUserDto, UpdateUserDto } from '../../../application/dtos/user.dto';
import { ForbiddenError } from '../../../domain/errors/domain-error';
import { UserType } from '../../../domain/entities/user';

/**
 * User controller for HTTP interface
 */
export class UserController {
  /**
   * Get all users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        name: req.query.name as string,
        userType: req.query.userType as UserType,
        active: req.query.active === 'true' ? true :
                req.query.active === 'false' ? false : undefined
      };

      const users = await userService.getAllUsers(filters);
      res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;

      // Special security check for creating admin users
      if (userData.userType === UserType.ADMIN) {
        // Get the current user's role (req.userId is set by auth middleware)
        const currentUser = await userService.getUserById(req.userId);

        // Only admins can create other admins
        if (currentUser.userType !== UserType.ADMIN) {
          throw new ForbiddenError('Only administrators can create admin users');
        }
      }

      const user = await userService.createUser(userData);

      res.status(201).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDto = req.body;

      // Security check: Only admins can update user types or if user is modifying their own account
      if (userData.userType && id !== req.userId) {
        const currentUser = await userService.getUserById(req.userId);

        if (currentUser.userType !== UserType.ADMIN) {
          throw new ForbiddenError('Only administrators can change user types');
        }
      }

      const user = await userService.updateUser(id, userData);

      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user is deleting themselves
      if (id === req.userId) {
        throw new ForbiddenError('Users cannot delete their own accounts');
      }

      await userService.deleteUser(id);

      res.json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get students by trainer ID
   */
  async getStudentsByTrainerId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trainerId } = req.params;
      const students = await userService.getStudentsByTrainerId(trainerId);

      res.json({
        status: 'success',
        data: students
      });
    } catch (error) {
      next(error);
    }
  }
}
