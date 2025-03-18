import { Request, Response, NextFunction } from 'express';
import { authService, userService } from '../../../application/services';
import {
  AuthUserDto,
  CreateUserDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto
} from '../../../application/dtos/user.dto';
import { UserType } from '../../../domain/entities/user';

/**
 * Authentication controller for HTTP interface
 */
export class AuthController {
  /**
   * User login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: AuthUserDto = req.body;
      const result = await authService.login(credentials);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User registration (for non-admin users)
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;

      // Public registration can only create STUDENT users
      userData.userType = UserType.STUDENT;

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
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: PasswordResetRequestDto = req.body;
      await authService.requestPasswordReset(data);

      res.json({
        status: 'success',
        message: 'If the email exists, a reset link has been sent'
      });
    } catch (error) {
      // Important: For security reasons, always return a success message
      // even if the email doesn't exist to avoid user enumeration
      res.json({
        status: 'success',
        message: 'If the email exists, a reset link has been sent'
      });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: PasswordResetConfirmDto = req.body;
      await authService.resetPassword(data);

      res.json({
        status: 'success',
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.userId is set by the auth middleware
      const user = await userService.getUserById(req.userId);

      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}
