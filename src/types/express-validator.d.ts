import { Request } from 'express';
import { Result, ValidationError } from 'express-validator';

declare global {
  namespace Express {
    interface Request {
      // Add any extensions to the Express Request interface here
    }
  }
}

// Declare the module to extend the Request interface
declare module 'express-validator' {
  export function validationResult(req: Request): Result<ValidationError>;
}
