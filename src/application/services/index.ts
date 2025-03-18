import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { userRepository } from '../../infrastructure/persistence/sequelize/repositories';

// Create and export service instances with their dependencies injected
export const userService = new UserService(userRepository);
export const authService = new AuthService(userRepository);

// Export service classes for testing and custom initialization
export { UserService, AuthService };
