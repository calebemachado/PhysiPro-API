import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from '../models/user.model';
import { UserType } from '../types/model';
import { sendEmail } from '../services/email.service';
import { AppError } from '../utils/app-error';

// Environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generate JWT token for authenticated users
 */
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Login controller - authenticate user and return token
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.active) {
      throw new AppError('Your account is inactive. Please contact support.', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    // Send response
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        userType: user.userType,
        profileImage: user.profileImage,
        trainerId: user.trainerId,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register controller - create new student user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, cpf } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // Check if CPF already exists
    const existingCpf = await User.findOne({ where: { cpf } });
    if (existingCpf) {
      throw new AppError('CPF already registered', 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed in the model hooks
      cpf,
      userType: UserType.STUDENT, // Default to student for self-registration
      active: true,
    });

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to PhysiPro',
        text: `Hi ${name}, welcome to PhysiPro! Your account has been created successfully.`,
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue even if email fails
    }

    // Generate token
    const token = generateToken(user.id);

    // Send response
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        userType: user.userType,
        profileImage: user.profileImage,
        trainerId: user.trainerId,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password controller - send reset password email
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('User not found with this email', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (10 minutes)
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with reset token info
    await user.update({
      resetPasswordToken,
      resetPasswordExpires,
    });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset',
        text: `You requested a password reset. Please go to this link to reset your password: ${resetURL}. This link is valid for 10 minutes.`,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (emailError) {
      // If sending email fails, revert the token
      await user.update({
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      throw new AppError('Error sending email. Please try again.', 500);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password controller - update password with token
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Hash the received token to compare with stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // Update password and clear reset token fields
    await user.update({
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
}; 