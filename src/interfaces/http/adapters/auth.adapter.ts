import { IAuthPort } from '../../../application/ports/auth.port';
import { UserType } from '../../../domain/entities/user';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors/domain-error';
import { authService } from '../../../application/services';
import { userService } from '../../../application/services';

/**
 * HTTP adapter for authentication
 * Implements the authentication port for the HTTP interface
 */
export class HttpAuthAdapter implements IAuthPort {
  /**
   * Authenticate user from HTTP Authorization header
   */
  authenticate(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedError('Authorization header is missing');
    }

    // Check for Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization format. Use: Bearer [token]');
    }

    const token = parts[1];

    try {
      // Verify token and return user ID
      return authService.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Authorize user for specific roles
   */
  async authorize(userId: string, requiredRoles: UserType[]): Promise<boolean> {
    try {
      // Get user details
      const user = await userService.getUserById(userId);

      // Check if user is active
      if (!user.active) {
        throw new ForbiddenError('User account is inactive');
      }

      // Check if user has required role
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.userType)) {
        throw new ForbiddenError(`Requires one of these roles: ${requiredRoles.join(', ')}`);
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      throw new UnauthorizedError('Authorization failed');
    }
  }

  /**
   * Extract user ID from token
   */
  getUserIdFromToken(token: string): string {
    try {
      return authService.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  }
}
