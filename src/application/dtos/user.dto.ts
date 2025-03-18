import { UserType } from '../../domain/entities/user';

/**
 * Data transfer object for user creation
 */
export interface CreateUserDto {
  name: string;
  email: string;
  cpf: string;
  password: string;
  userType: UserType;
  trainerId?: string;
}

/**
 * Data transfer object for user update
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  cpf?: string;
  password?: string;
  userType?: UserType;
  active?: boolean;
  trainerId?: string;
}

/**
 * Data transfer object for user authentication
 */
export interface AuthUserDto {
  email: string;
  password: string;
}

/**
 * Data transfer object for password reset request
 */
export interface PasswordResetRequestDto {
  email: string;
}

/**
 * Data transfer object for password reset confirmation
 */
export interface PasswordResetConfirmDto {
  token: string;
  password: string;
}

/**
 * Data transfer object for user response (excludes sensitive data)
 */
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  cpf: string;
  userType: UserType;
  active: boolean;
  trainerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for authentication response
 */
export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
}
