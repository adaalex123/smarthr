import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../utils/errorHandler.js';
import { AuthPayload } from '../types/auth.js';

export const authenticateToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token = (req.cookies?.accessToken || req.cookies?.token) as string | undefined;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    if (typeof decoded === 'string' || !decoded.id || !decoded.email || !decoded.role) {
      throw new AppError('Invalid token', 401);
    }

    req.user = decoded as AuthPayload;
    next();
  } catch (error) {
    next(error);
  }
};
