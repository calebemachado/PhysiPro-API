import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserType } from '../types/model';
import { User } from '../models/user.model';
import { AppError } from '../utils/app-error';
import { validationResult } from 'express-validator';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure passport JWT strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        // Find user by ID from JWT payload
        const user = await User.findByPk(jwtPayload.id);
        
        if (!user) {
          return done(null, false);
        }
        
        if (!user.active) {
          return done(new AppError('User account is inactive', 401), false);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
    return;
  }
  next();
};

/**
 * Middleware to authenticate user with JWT
 */
export const authenticate = passport.authenticate('jwt', { session: false });

/**
 * Middleware to authorize user by roles
 * @param allowedRoles Array of user types allowed to access the resource
 */
export const authorizeRoles = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.userType as UserType)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    // If user is a trainer, additional checks might be needed for specific routes
    // This can be expanded based on business logic
    
    next();
  };
};

/**
 * Middleware to check if user can access a specific user's data
 * Admins can access any user, trainers can access their students, users can access themselves
 */
export const canAccessUser = (req: Request, res: Response, next: NextFunction): void => {
  const { user } = req;
  const requestedUserId = req.params.id;

  if (!user) {
    return next(new AppError('Authentication required', 401));
  }

  // Admin can access any user
  if (user.userType === UserType.ADMIN) {
    return next();
  }

  // Users can access their own data
  if (user.id === requestedUserId) {
    return next();
  }

  // Trainers can access their students
  if (user.userType === UserType.TRAINER) {
    // Check if requested user is a student of the trainer
    User.findByPk(requestedUserId)
      .then((targetUser) => {
        if (targetUser && targetUser.userType === UserType.STUDENT && targetUser.trainerId === user.id) {
          return next();
        }
        next(new AppError('You do not have permission to access this user data', 403));
      })
      .catch((err) => next(err));
    return;
  }

  // Otherwise, deny access
  next(new AppError('You do not have permission to access this user data', 403));
}; 