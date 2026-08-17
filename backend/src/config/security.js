// src/config/security.js
import dotenv from 'dotenv';

dotenv.config();

export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  bcrypt: {
    saltRounds: 10,
  },
  cookie: {
    httpOnly: process.env.COOKIE_HTTPONLY === 'true' ? true : true,
    secure: process.env.COOKIE_SECURE === 'true' ? true : false,
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  loginRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  },
};