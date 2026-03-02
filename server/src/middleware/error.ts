import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom application error with status code and machine-readable code.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 404 handler — catches unmatched routes.
 */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));
}

/**
 * Global error handler — returns consistent JSON error envelope.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Known app error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  // Prisma unique constraint violation
  if ('code' in err && typeof (err as Record<string, unknown>).code === 'string') {
    const prismaErr = err as Error & { code: string };
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { message: 'A record with that value already exists', code: 'DUPLICATE_ENTRY' },
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { message: 'Record not found', code: 'NOT_FOUND' },
      });
      return;
    }
  }

  // Unknown / internal errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL_ERROR',
    },
  });
}
