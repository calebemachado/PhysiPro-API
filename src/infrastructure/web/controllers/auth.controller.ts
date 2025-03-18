import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../../../domain/services/auth.service.interface';
import { UserLoginDTO, PasswordResetRequestDTO, PasswordResetConfirmDTO } from '../../../domain/entities/user';
import { DomainError } from '../../../domain/errors/domain-error';

/**
 * Interface for requests with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: any; // The user object set by the auth middleware
}

/**
 * Auth Controller
 */
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials: UserLoginDTO = req.body;
      const authResponse = await this.authService.login(credentials);
      res.status(200).json(authResponse);
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
   * Request password reset
   */
  requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resetRequest: PasswordResetRequestDTO = req.body;
      await this.authService.requestPasswordReset(resetRequest);

      // Always return success, even if email doesn't exist (security best practice)
      res.status(200).json({
        message: 'If the email exists, a password reset link has been sent to it'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Confirm password reset
   */
  confirmPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resetConfirm: PasswordResetConfirmDTO = req.body;
      await this.authService.confirmPasswordReset(resetConfirm);
      res.status(200).json({ message: 'Password reset successful' });
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
   * Change password
   */
  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
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
   * Get current user profile
   */
  getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // The user object is set by the auth middleware
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  };
}
