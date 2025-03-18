import { Model, ModelStatic, Optional } from 'sequelize';
import 'express';

// Define UserType enum to be exported
export enum UserType {
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  STUDENT = 'STUDENT'
}

// User model interfaces
export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  cpf: string;
  userType: UserType;
  profileImage?: string | null;
  trainerId?: string | null;
  active: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'profileImage' | 'trainerId' | 'resetPasswordToken' | 'resetPasswordExpires' | 'createdAt' | 'updatedAt'> {}

// User Model with instance methods
export interface UserModel extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  comparePassword(password: string): Promise<boolean>;
}

// User Model Static with static methods
export interface UserModelStatic extends ModelStatic<UserModel> {
  canRegisterUserType(registrarType: UserType, targetType: UserType): boolean;
  formatForResponse(user: UserModel | UserAttributes): Omit<UserAttributes, 'password'>;
}

// Declare global Express User type for auth
declare global {
  namespace Express {
    interface User extends UserAttributes {}
    
    interface Request {
      user?: UserAttributes;
    }
  }
}

// Email service interface
export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Error interface for custom application errors
export interface AppErrorOptions {
  message: string;
  statusCode: number;
  stack?: string;
} 