import { UserType } from '../../domain/entities/user';

/**
 * Authentication port interface
 * Defines methods that the interface layer needs to implement
 * for handling authentication
 */
export interface IAuthPort {
  /**
   * Authenticate a request
   * Returns the authenticated user ID if valid
   */
  authenticate(authHeader: string): string;

  /**
   * Authorize a user for specific operations
   * Checks if the user has the required permissions
   */
  authorize(userId: string, requiredRoles: UserType[]): Promise<boolean>;

  /**
   * Get authenticated user ID from token
   */
  getUserIdFromToken(token: string): string;
}
