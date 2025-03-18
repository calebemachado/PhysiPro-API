import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers';
import { authMiddleware } from '../middleware';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authMiddleware.handleValidationErrors,
  authController.login
);

/**
 * @route   POST /api/auth/request-reset
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/request-reset',
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  authMiddleware.handleValidationErrors,
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authMiddleware.handleValidationErrors,
  authController.confirmPasswordReset
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  authMiddleware.authenticate,
  authMiddleware.handleValidationErrors,
  authController.changePassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware.authenticate,
  authController.getCurrentUser
);

export default router;
