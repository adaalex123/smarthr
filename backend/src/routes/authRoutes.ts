import express from 'express';
import {
  register,
  login,
  oauth,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  validate,
  registerValidation,
  loginValidation,
  oauthValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/register', validate(registerValidation), register);
router.post('/signup', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/oauth', validate(oauthValidation), oauth);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);
router.post('/logout', logout);

router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, validate(updateProfileValidation), updateProfile);

export default router;
