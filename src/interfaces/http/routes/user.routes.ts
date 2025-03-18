import { Router } from 'express';
import { userController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserType } from '../../../domain/entities/user';
import {
  createUserValidation,
  updateUserValidation
} from '../../../application/validation/user.validation';
import { param } from 'express-validator';

// Create router
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [ADMIN, TRAINER, STUDENT]
 *         description: Filter by user type
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, authorize([UserType.ADMIN, UserType.TRAINER]), userController.getAllUsers.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid user ID format')],
  validate,
  userController.getUserById.bind(userController)
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
router.post('/',
  authenticate,
  authorize([UserType.ADMIN, UserType.TRAINER]),
  createUserValidation,
  validate,
  userController.createUser.bind(userController)
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               cpf:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [ADMIN, TRAINER, STUDENT]
 *               active:
 *                 type: boolean
 *               trainerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
router.put('/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid user ID format'),
    ...updateUserValidation
  ],
  validate,
  userController.updateUser.bind(userController)
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/:id',
  authenticate,
  authorize([UserType.ADMIN]),
  [param('id').isUUID().withMessage('Invalid user ID format')],
  validate,
  userController.deleteUser.bind(userController)
);

/**
 * @swagger
 * /users/trainer/{trainerId}/students:
 *   get:
 *     summary: Get all students for a trainer
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *       404:
 *         description: Trainer not found
 */
router.get('/trainer/:trainerId/students',
  authenticate,
  [param('trainerId').isUUID().withMessage('Invalid trainer ID format')],
  validate,
  userController.getStudentsByTrainerId.bind(userController)
);

// Export the router
export const userRoutes = router;
