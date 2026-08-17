// src/middlewares/authenticateToken.js
import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/security.js';
import { AppError } from '../utils/errorHandler.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Check for token in cookie or Authorization header
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, securityConfig.jwt.secret);
    
    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};