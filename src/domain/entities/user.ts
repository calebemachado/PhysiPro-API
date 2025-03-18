/**
 * User types enum
 */
export enum UserType {
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  STUDENT = 'STUDENT'
}

/**
 * User entity in the domain layer
 */
export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  password: string;
  userType: UserType;
  active: boolean;
  trainerId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation data transfer object
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  cpf: string;
  password: string;
  userType: UserType;
  trainerId?: string;
}

/**
 * User update data transfer object
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  cpf?: string;
  password?: string;
  userType?: UserType;
  active?: boolean;
  trainerId?: string;
}

/**
 * User login data transfer object
 */
export interface UserLoginDTO {
  email: string;
  password: string;
}

/**
 * Password reset request data transfer object
 */
export interface PasswordResetRequestDTO {
  email: string;
}

/**
 * Password reset confirmation data transfer object
 */
export interface PasswordResetConfirmDTO {
  token: string;
  password: string;
}

/**
 * User profile view data transfer object (excludes sensitive information)
 */
export interface UserProfileDTO {
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
 * Convert a User entity to a UserProfileDTO (omitting sensitive information)
 */
export const toUserProfile = (user: User): UserProfileDTO => {
  const { password, resetPasswordToken, resetPasswordExpires, ...profile } = user;
  return profile as UserProfileDTO;
};

/**
 * Validates if the provided email has a valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if the provided CPF has a valid format
 * Only checks if it's 11 digits, a more complete validation would include checksum
 */
export function isValidCpf(cpf: string): boolean {
  // Remove any non-digit characters
  const cleanCpf = cpf.replace(/\D/g, '');
  return cleanCpf.length === 11;
}

/**
 * Validates if a password is strong enough
 * At least 8 characters, with at least one letter and one number
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 &&
         /[A-Za-z]/.test(password) &&
         /[0-9]/.test(password);
}
