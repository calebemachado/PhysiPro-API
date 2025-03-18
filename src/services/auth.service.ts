import userRepository from '../repositories/user.repository';
import { generateToken, formatLoginResponse } from '../utils/auth.utils';
import { LoginResponse, UserAttributes } from '../types/common';

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Login a user
   * @param {UserAttributes} user - Authenticated user
   * @returns {Promise<LoginResponse>} Login response with user data and token
   */
  async login(user: UserAttributes): Promise<LoginResponse> {
    // Generate JWT token
    const token = generateToken(user);
    
    // Format and return login response
    return formatLoginResponse(user, token);
  }

  /**
   * Get user profile from authenticated request
   * @param {UserAttributes} user - Authenticated user from request
   * @returns {Promise<UserAttributes>} User profile
   */
  async getProfile(user: UserAttributes): Promise<UserAttributes> {
    const userProfile = await userRepository.findById(user.id);
    
    if (!userProfile || !userProfile.active) {
      throw new Error('User not found');
    }
    
    return userProfile;
  }
}

export default new AuthService(); 