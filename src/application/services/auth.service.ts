import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import {
  InvalidCredentialsError,
  UserNotFoundError,
  ValidationError,
  InvalidResetTokenError
} from '../../domain/errors/domain-error';
import { AuthUserDto, AuthResponseDto, PasswordResetRequestDto, PasswordResetConfirmDto, UserResponseDto } from '../dtos/user.dto';
import { isStrongPassword } from '../../domain/entities/user';

/**
 * Authentication service class
 * Handles user authentication, token generation, and password management
 */
export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string = process.env.JWT_SECRET || 'physipro-secret-key',
    private tokenExpiresIn: string = process.env.TOKEN_EXPIRES_IN || '24h'
  ) {}

  /**
   * Map user domain entity to user response DTO (excluding sensitive data)
   */
  private toUserResponseDto(user: any): UserResponseDto {
    const { password, resetPasswordToken, resetPasswordExpires, ...userDto } = user;
    return userDto as UserResponseDto;
  }

  /**
   * Generate JWT token for authenticated user
   */
  private generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      this.jwtSecret,
      {
        expiresIn: this.tokenExpiresIn
      } as jwt.SignOptions
    );
  }

  /**
   * User login
   */
  async login(credentials: AuthUserDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Check if user is active
    if (!user.active) {
      throw new ValidationError('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: this.toUserResponseDto(user),
      token
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequestDto): Promise<void> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    await this.userRepository.update({
      ...user,
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
      updatedAt: new Date()
    });

    // Note: In a real application, send email with reset token
    // This would typically integrate with an email service
    console.log(`Password reset token for ${data.email}: ${resetToken}`);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: PasswordResetConfirmDto): Promise<void> {
    // Validate password strength
    if (!isStrongPassword(data.password)) {
      throw new ValidationError('Password must be at least 8 characters and contain letters and numbers');
    }

    // Find user by reset token
    const user = await this.userRepository.findByResetToken(data.token);

    if (!user) {
      throw new InvalidResetTokenError();
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Update user with new password and clear reset token
    await this.userRepository.update({
      ...user,
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      updatedAt: new Date()
    });
  }

  /**
   * Verify JWT token and return user ID
   */
  verifyToken(token: string): string {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { id: string };
      return decoded.id;
    } catch (error) {
      throw new InvalidCredentialsError();
    }
  }
}
