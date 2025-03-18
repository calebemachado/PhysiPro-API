import { User, UserLoginDTO, PasswordResetRequestDTO, PasswordResetConfirmDTO } from '../entities/user';

/**
 * Authentication response data
 */
export interface AuthResponse {
  token: string;
  user: Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'>;
}

/**
 * Interface for authentication service
 */
export interface IAuthService {
  /**
   * Authenticate a user with email and password
   */
  login(credentials: UserLoginDTO): Promise<AuthResponse>;

  /**
   * Generate JWT token for a user
   */
  generateToken(user: User): string;

  /**
   * Verify a JWT token and extract user information
   */
  verifyToken(token: string): Promise<User | null>;

  /**
   * Request a password reset for a user
   */
  requestPasswordReset(resetRequest: PasswordResetRequestDTO): Promise<boolean>;

  /**
   * Confirm a password reset with token and new password
   */
  confirmPasswordReset(resetConfirm: PasswordResetConfirmDTO): Promise<boolean>;

  /**
   * Change a user's password with their current password for verification
   */
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;
}
