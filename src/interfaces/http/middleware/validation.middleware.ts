import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../../../domain/errors/domain-error';

/**
 * Validation middleware
 * Validates request data using express-validator
 * Throws a ValidationError if validation fails
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ExpressValidationError) => {
      if ('path' in error && 'msg' in error) {
        return `${error.path}: ${error.msg}`;
      }
      return error.msg;
    });

    next(new ValidationError(errorMessages.join(', ')));
    return;
  }

  next();
};
