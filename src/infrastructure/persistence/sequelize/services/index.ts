import { UserService } from './user.service';
import { userRepository } from '../repositories';
import { JwtAuthService } from '../../../auth/jwt.auth.service';

// Create and export service instances
export const userService = new UserService(userRepository);
export const authService = new JwtAuthService(userRepository);
