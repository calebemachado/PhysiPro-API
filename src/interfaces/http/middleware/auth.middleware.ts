import { Request, Response, NextFunction } from 'express';
import { UserType } from '../../../domain/entities/user';
import { HttpAuthAdapter } from '../adapters/auth.adapter';

// Create auth adapter instance
const authAdapter = new HttpAuthAdapter();

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const userId = authAdapter.authenticate(authHeader || '');

    // Attach user ID to request for use in route handlers
    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required roles
 */
export const authorize = (roles: UserType[] = []) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User must be authenticated first
      if (!req.userId) {
        return next(new Error('User is not authenticated'));
      }

      await authAdapter.authorize(req.userId, roles);
      next();
    } catch (error) {
      next(error);
    }
  };
};
