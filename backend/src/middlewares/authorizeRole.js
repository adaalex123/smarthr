// src/middlewares/authorizeRole.js
import { AppError } from '../utils/errorHandler.js';

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      throw new AppError(
        `Access denied. ${userRole} role does not have permission.`,
        403
      );
    }

    next();
  };
};