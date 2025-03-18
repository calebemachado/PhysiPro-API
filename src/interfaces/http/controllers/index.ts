import { UserController } from './user.controller';
import { AuthController } from './auth.controller';

// Create controller instances
export const userController = new UserController();
export const authController = new AuthController();

// Export controller classes for testing and direct access
export { UserController, AuthController };
