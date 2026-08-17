import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

type FieldError = { field: string; message: string };

export class AppError extends Error {
  statusCode: number;
  errors: FieldError[] | null;
  isOperational: boolean;

  constructor(message: string, statusCode: number, errors: FieldError[] | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function isPrismaError(err: unknown): err is { code: string; meta?: { target?: string[] } } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (isPrismaError(err) && err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      field: err.meta?.target?.[0] || 'unknown',
    });
  }

  if (isPrismaError(err) && err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    });
  }

  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (fn: AsyncRoute) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
