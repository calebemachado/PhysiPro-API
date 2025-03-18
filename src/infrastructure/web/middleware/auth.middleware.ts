import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { IAuthService } from '../../../domain/services/auth.service.interface';
import { UserType } from '../../../domain/entities/user';
import { AuthenticatedRequest } from '../controllers/auth.controller';
import { toUserProfile } from '../../../domain/entities/user';
import { ForbiddenError, UnauthorizedError } from '../../../domain/errors/domain-error';

/**
 * Extracts token from authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};

/**
 * Authentication middleware factory
 */
export const createAuthMiddleware = (authService: IAuthService) => {
  /**
   * Authenticates a user based on JWT token
   */
  const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractToken(req);
      if (!token) {
        throw new UnauthorizedError('Authentication token missing');
      }

      const user = await authService.verifyToken(token);
      if (!user) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Set user profile in request (without sensitive data)
      req.user = toUserProfile(user);
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          message: error.message,
          code: error.code
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Authorizes user based on user type
   */
  const authorize = (allowedTypes: UserType[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      try {
        const user = req.user;

        if (!user) {
          throw new UnauthorizedError('Authentication required');
        }

        if (!allowedTypes.includes(user.userType)) {
          throw new ForbiddenError('Insufficient permissions');
        }

        next();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          res.status(401).json({
            message: error.message,
            code: error.code
          });
          return;
        }

        if (error instanceof ForbiddenError) {
          res.status(403).json({
            message: error.message,
            code: error.code
          });
          return;
        }

        next(error);
      }
    };
  };

  /**
   * Handles validation errors from express-validator
   */
  const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    next();
  };

  /**
   * Checks if the user owns the resource or is admin
   */
  const ownerOrAdmin = (userIdParam: string = 'id') => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      try {
        const user = req.user;
        const resourceUserId = req.params[userIdParam];

        if (!user) {
          throw new UnauthorizedError('Authentication required');
        }

        // Admin can access any resource
        if (user.userType === UserType.ADMIN) {
          next();
          return;
        }

        // Trainer can access their own resources and their students'
        if (user.userType === UserType.TRAINER && resourceUserId === user.id) {
          next();
          return;
        }

        // Users can only access their own resources
        if (resourceUserId === user.id) {
          next();
          return;
        }

        throw new ForbiddenError('You do not have permission to access this resource');
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          res.status(401).json({
            message: error.message,
            code: error.code
          });
          return;
        }

        if (error instanceof ForbiddenError) {
          res.status(403).json({
            message: error.message,
            code: error.code
          });
          return;
        }

        next(error);
      }
    };
  };

  return {
    authenticate,
    authorize,
    handleValidationErrors,
    ownerOrAdmin
  };
};
