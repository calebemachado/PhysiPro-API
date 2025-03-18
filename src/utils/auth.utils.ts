import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { JwtPayload, LoginResponse, UserAttributes, UserType } from '../types/common';

/**
 * Generate JWT token for authenticated users
 * @param {UserAttributes} user - User object
 * @returns {string} JWT token
 */
export const generateToken = (user: UserAttributes): string => {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    userType: user.userType,
  };

  return jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Format login response with user data and token
 * @param {UserAttributes} user - User object
 * @param {string} token - JWT token
 * @returns {LoginResponse} Formatted response
 */
export const formatLoginResponse = (user: UserAttributes, token: string): LoginResponse => {
  const userData = User.formatForResponse(user);
  
  return {
    user: userData,
    token,
  };
};

/**
 * Check if user has required role
 * @param {UserType} requiredRole - Required role
 * @returns {Function} Middleware function
 */
export const checkRole = (requiredRole: UserType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // TypeScript casting necessary because req.user doesn't have userType by default
    const userWithType = req.user as UserAttributes;

    // For ADMIN, allow access to all roles
    if (userWithType.userType === UserType.ADMIN) {
      next();
      return;
    }

    // For other cases, check if user has the required role
    if (requiredRole !== userWithType.userType) {
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
};

/**
 * Check if user can create a user of specified type
 * @param {UserType} userType - User type to check
 * @returns {Function} Middleware function
 */
export const canCreateUserType = (userType: UserType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // TypeScript casting necessary because req.user doesn't have userType by default
    const userWithType = req.user as UserAttributes;
    
    const canCreate = User.canRegisterUserType(userWithType.userType, userType);
    
    if (!canCreate) {
      res.status(403).json({
        message: `You don't have permission to create a ${userType} user.`,
      });
      return;
    }

    next();
  };
}; 