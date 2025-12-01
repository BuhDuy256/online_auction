import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors';
import { ZodError } from 'zod';
import { envConfig } from '../config/env.config';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(error instanceof ValidationError && { details: error.details }),
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Handle Knex/Postgres errors
  // Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  const pgError = error as any;
  if (pgError.code) {
    if (pgError.code === '23505') { // unique_violation
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry',
        field: pgError.detail,
      });
    }
    if (pgError.code === '23503') { // foreign_key_violation
      return res.status(400).json({
        success: false,
        error: 'Invalid reference',
        details: pgError.detail,
      });
    }
    // Add other specific error codes if needed
  }

  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    ...(envConfig.NODE_ENV === 'development' && {
      message: error.message,
      stack: error.stack
    }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  return res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};
