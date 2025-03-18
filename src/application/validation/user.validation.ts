import { check, validationResult, ValidationChain } from 'express-validator';
import { UserType } from '../../domain/entities/user';

/**
 * Validation chains for user registration
 */
export const registerValidation: ValidationChain[] = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),

  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  check('cpf')
    .trim()
    .notEmpty()
    .withMessage('CPF is required')
    .isLength({ min: 11, max: 14 })
    .withMessage('CPF must be 11 digits')
    .matches(/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})$/)
    .withMessage('Invalid CPF format'),

  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),

  check('trainerId')
    .optional()
    .isUUID()
    .withMessage('Trainer ID must be a valid UUID')
];

/**
 * Validation chains for user creation (with user type)
 */
export const createUserValidation: ValidationChain[] = [
  ...registerValidation,
  check('userType')
    .notEmpty()
    .withMessage('User type is required')
    .isIn(Object.values(UserType))
    .withMessage('Invalid user type')
];

/**
 * Validation chains for user login
 */
export const loginValidation: ValidationChain[] = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation chains for user update
 */
export const updateUserValidation: ValidationChain[] = [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),

  check('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  check('cpf')
    .optional()
    .trim()
    .isLength({ min: 11, max: 14 })
    .withMessage('CPF must be 11 digits')
    .matches(/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})$/)
    .withMessage('Invalid CPF format'),

  check('password')
    .optional()
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),

  check('userType')
    .optional()
    .isIn(Object.values(UserType))
    .withMessage('Invalid user type'),

  check('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),

  check('trainerId')
    .optional()
    .isUUID()
    .withMessage('Trainer ID must be a valid UUID')
];

/**
 * Validation chains for password reset request
 */
export const passwordResetRequestValidation: ValidationChain[] = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
];

/**
 * Validation chains for password reset confirmation
 */
export const passwordResetConfirmValidation: ValidationChain[] = [
  check('token')
    .trim()
    .notEmpty()
    .withMessage('Token is required'),

  check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number')
];
