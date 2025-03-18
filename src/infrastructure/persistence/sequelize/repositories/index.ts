import { SequelizeUserRepository } from './user.repository';

// Export singleton instances of all repositories
export const userRepository = new SequelizeUserRepository();
