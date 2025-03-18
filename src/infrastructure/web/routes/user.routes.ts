import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userController } from '../controllers';
import { authMiddleware } from '../middleware';
import { UserType } from '../../../domain/entities/user';

const router = Router();

/**
 * Validate user creation fields
 */
const validateCreateUser = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('cpf')
    .notEmpty().withMessage('CPF is required')
    .isLength({ min: 11, max: 11 }).withMessage('CPF must be exactly 11 characters')
    .matches(/^\d+$/).withMessage('CPF must contain only numbers'),

  body('userType')
    .notEmpty().withMessage('User type is required')
    .isIn(Object.values(UserType)).withMessage('Invalid user type'),

  body('trainerId')
    .optional()
    .isUUID().withMessage('Trainer ID must be a valid UUID')
];

/**
 * Validate user update fields
 */
const validateUpdateUser = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),

  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('cpf')
    .optional()
    .isLength({ min: 11, max: 11 }).withMessage('CPF must be exactly 11 characters')
    .matches(/^\d+$/).withMessage('CPF must contain only numbers'),

  body('userType')
    .optional()
    .isIn(Object.values(UserType)).withMessage('Invalid user type'),

  body('active')
    .optional()
    .isBoolean().withMessage('Active must be a boolean'),

  body('trainerId')
    .optional()
    .isUUID().withMessage('Trainer ID must be a valid UUID')
];

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filters
 * @access  Private (Admin only)
 */
router.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize([UserType.ADMIN]),
  userController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID')
  ],
  authMiddleware.authenticate,
  authMiddleware.handleValidationErrors,
  authMiddleware.ownerOrAdmin('id'),
  userController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post(
  '/',
  validateCreateUser,
  authMiddleware.authenticate,
  authMiddleware.authorize([UserType.ADMIN]),
  authMiddleware.handleValidationErrors,
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    ...validateUpdateUser
  ],
  authMiddleware.authenticate,
  authMiddleware.handleValidationErrors,
  authMiddleware.ownerOrAdmin('id'),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID')
  ],
  authMiddleware.authenticate,
  authMiddleware.authorize([UserType.ADMIN]),
  authMiddleware.handleValidationErrors,
  userController.deleteUser
);

/**
 * @route   GET /api/users/type/:type
 * @desc    Get users by type
 * @access  Private (Admin only)
 */
router.get(
  '/type/:type',
  [
    param('type').isIn(Object.values(UserType)).withMessage('Invalid user type')
  ],
  authMiddleware.authenticate,
  authMiddleware.authorize([UserType.ADMIN]),
  authMiddleware.handleValidationErrors,
  userController.getUsersByType
);

/**
 * @route   GET /api/users/trainer/:trainerId/students
 * @desc    Get students by trainer ID
 * @access  Private (Trainer or Admin)
 */
router.get(
  '/trainer/:trainerId/students',
  [
    param('trainerId').isUUID().withMessage('Trainer ID must be a valid UUID')
  ],
  authMiddleware.authenticate,
  authMiddleware.handleValidationErrors,
  authMiddleware.ownerOrAdmin('trainerId'),
  userController.getStudentsByTrainerId
);

/**
 * @route   POST /api/users/check-email
 * @desc    Check if email exists
 * @access  Public
 */
router.post(
  '/check-email',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    query('excludeUserId').optional().isUUID().withMessage('Exclude user ID must be a valid UUID')
  ],
  authMiddleware.handleValidationErrors,
  userController.checkEmailExists
);

/**
 * @route   POST /api/users/check-cpf
 * @desc    Check if CPF exists
 * @access  Public
 */
router.post(
  '/check-cpf',
  [
    body('cpf')
      .isLength({ min: 11, max: 11 }).withMessage('CPF must be exactly 11 characters')
      .matches(/^\d+$/).withMessage('CPF must contain only numbers'),
    query('excludeUserId').optional().isUUID().withMessage('Exclude user ID must be a valid UUID')
  ],
  authMiddleware.handleValidationErrors,
  userController.checkCpfExists
);

export default router;
