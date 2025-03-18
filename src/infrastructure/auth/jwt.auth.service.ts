import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { IAuthService, AuthResponse } from '../../domain/services/auth.service.interface';
import { User, UserLoginDTO, PasswordResetRequestDTO, PasswordResetConfirmDTO } from '../../domain/entities/user';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import {
  InvalidCredentialsError,
  UserNotFoundError,
  InvalidResetTokenError
} from '../../domain/errors/domain-error';
import { toUserProfile } from '../../domain/entities/user';

/**
 * JWT Auth Service Implementation
 */
export class JwtAuthService implements IAuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenSecret: string = process.env.JWT_SECRET || 'your-secret-key',
    private readonly tokenExpiresIn: string = process.env.JWT_EXPIRES_IN || '24h'
  ) {
    this.JWT_SECRET = tokenSecret;
    this.JWT_EXPIRES_IN = tokenExpiresIn;
  }

  /**
   * Authenticate a user with email and password
   */
  async login(credentials: UserLoginDTO): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Check if user is active
    if (!user.active) {
      throw new InvalidCredentialsError();
    }

    // Since we are at the infrastructure layer, we need to call the model's method
    // This is a bit of a leak between layers, but is a practical solution
    // For a purer approach, password comparison would be in the domain layer
    const isMatch = await this.comparePasswords(password, user.password);
    if (!isMatch) {
      throw new InvalidCredentialsError();
    }

    // Generate token
    const token = this.generateToken(user);

    // Return auth response with user profile (excluding sensitive data)
    return {
      token,
      user: toUserProfile(user)
    };
  }

  /**
   * Generate JWT token for a user
   */
  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType
    };

    return jwt.sign(
      payload,
      this.JWT_SECRET,
      {
        expiresIn: this.JWT_EXPIRES_IN
      } as jwt.SignOptions
    );
  }

  /**
   * Verify a JWT token and extract user information
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as jwt.JwtPayload;
      const userId = decoded.sub as string;

      return await this.userRepository.findById(userId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Request a password reset for a user
   */
  async requestPasswordReset(resetRequest: PasswordResetRequestDTO): Promise<boolean> {
    const { email } = resetRequest;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if the email exists
      return true;
    }

    // Generate a reset token
    const resetToken = uuidv4();

    // Set token expiration (1 hour from now)
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Update user with reset token and expiration
    const updatedUser = {
      ...user,
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    };

    await this.userRepository.update(updatedUser);

    // Here, you would typically send an email with the reset token
    // This is just to simulate the functionality
    console.log(`Reset token for ${email}: ${resetToken}`);

    return true;
  }

  /**
   * Confirm a password reset with token and new password
   */
  async confirmPasswordReset(resetConfirm: PasswordResetConfirmDTO): Promise<boolean> {
    const { token, password } = resetConfirm;

    // Find user by reset token (validation for expiration is in the repository)
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new InvalidResetTokenError();
    }

    // Update user password and clear reset token
    const updatedUser = {
      ...user,
      password,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    };

    await this.userRepository.update(updatedUser);

    return true;
  }

  /**
   * Change a user's password with their current password for verification
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Find user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Verify current password
    const isMatch = await this.comparePasswords(currentPassword, user.password);
    if (!isMatch) {
      throw new InvalidCredentialsError();
    }

    // Update user with new password
    const updatedUser = {
      ...user,
      password: newPassword
    };

    await this.userRepository.update(updatedUser);

    return true;
  }

  /**
   * Compare plain text password with hashed password
   * This is a helper method that would ideally be in the domain layer
   */
  private async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    // Using bcrypt directly since we're in the infrastructure layer
    return await bcrypt.compare(password, hashedPassword);
  }
}
