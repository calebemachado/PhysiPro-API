import { UserController } from './user.controller';
import { AuthController } from './auth.controller';
import { userService } from '../../persistence/sequelize/services';
import { authService } from '../../persistence/sequelize/services';

// Create and export controller instances
export const userController = new UserController(userService);
export const authController = new AuthController(authService);
