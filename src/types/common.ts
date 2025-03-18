export enum UserType {
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  STUDENT = 'STUDENT',
}

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  cpf: string;
  userType: UserType;
  profileImage?: string;
  trainerId?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes {
  name: string;
  email: string;
  password: string;
  cpf: string;
  userType: UserType;
  profileImage?: string;
  trainerId?: string;
  active?: boolean;
}

export interface LoginResponse {
  user: Omit<UserAttributes, 'password'>;
  token: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  userType: UserType;
  iat?: number;
  exp?: number;
} 