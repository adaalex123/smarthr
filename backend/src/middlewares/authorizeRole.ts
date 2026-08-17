import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errorHandler.js';
import { UserRole } from '../types/auth.js';

export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. ${req.user.role} role does not have permission.`,
        403
      );
    }

    next();
  };
};
