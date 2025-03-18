import { createAuthMiddleware } from './auth.middleware';
import { authService } from '../../persistence/sequelize/services';

// Create middleware instances
export const authMiddleware = createAuthMiddleware(authService);
