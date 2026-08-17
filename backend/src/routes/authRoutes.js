// src/routes/authRoutes.js
import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

export default router;