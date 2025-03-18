import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../../../domain/services/user.service.interface';
import { CreateUserDTO, UpdateUserDTO, UserType } from '../../../domain/entities/user';
import { DomainError } from '../../../domain/errors/domain-error';

/**
 * User controller
 */
export class UserController {
  constructor(private readonly userService: IUserService) {}

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new user
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDTO = req.body;
      const createdUser = await this.userService.createUser(userData);
      res.status(201).json(createdUser);
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.code,
          details: error.details
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Update an existing user
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const userData: UpdateUserDTO = req.body;
      const updatedUser = await this.userService.updateUser(userId, userData);
      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.code,
          details: error.details
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Delete a user
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      await this.userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.code,
          details: error.details
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Get all users (with optional filters)
   */
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract filter parameters from query
      const { name, email, cpf, userType, trainerId, active } = req.query;

      const filters = {
        ...(name && { name: name as string }),
        ...(email && { email: email as string }),
        ...(cpf && { cpf: cpf as string }),
        ...(userType && { userType: userType as UserType }),
        ...(trainerId && { trainerId: trainerId as string }),
        ...(active !== undefined && { active: active === 'true' })
      };

      const users = await this.userService.findUsers(filters);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get students by trainer ID
   */
  getStudentsByTrainerId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trainerId = req.params.trainerId;
      const students = await this.userService.findStudentsByTrainerId(trainerId);
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get users by type
   */
  getUsersByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userType = req.params.type as UserType;

      // Validate user type
      if (!Object.values(UserType).includes(userType)) {
        res.status(400).json({ message: 'Invalid user type' });
        return;
      }

      const users = await this.userService.findUsersByType(userType);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if email exists
   */
  checkEmailExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const excludeUserId = req.query.excludeUserId as string | undefined;

      const exists = await this.userService.isEmailRegistered(email, excludeUserId);
      res.status(200).json({ exists });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if CPF exists
   */
  checkCpfExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cpf } = req.body;
      const excludeUserId = req.query.excludeUserId as string | undefined;

      const exists = await this.userService.isCpfRegistered(cpf, excludeUserId);
      res.status(200).json({ exists });
    } catch (error) {
      next(error);
    }
  };
}
