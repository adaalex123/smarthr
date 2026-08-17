// src/controllers/authController.js
import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { securityConfig } from '../config/security.js';

export const register = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password, req);

  // Set HttpOnly cookie
  res.cookie('token', result.token, {
    httpOnly: securityConfig.cookie.httpOnly,
    secure: securityConfig.cookie.secure,
    sameSite: securityConfig.cookie.sameSite,
    maxAge: securityConfig.cookie.maxAge,
  });

  res.json({
    success: true,
    user: result.user,
    token: result.token,
    refreshToken: result.refreshToken,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await AuthService.refreshToken(refreshToken, req);

  // Update cookie
  res.cookie('token', result.token, {
    httpOnly: securityConfig.cookie.httpOnly,
    secure: securityConfig.cookie.secure,
    sameSite: securityConfig.cookie.sameSite,
    maxAge: securityConfig.cookie.maxAge,
  });

  res.json({
    success: true,
    token: result.token,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  await AuthService.logout(req.user.id, refreshToken, req);

  // Clear cookies
  res.clearCookie('token');
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await AuthService.getCurrentUser(req.user.id);

  res.json({
    success: true,
    user,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  // In production, send email
  // For demo, return reset token
  res.json({
    success: true,
    message: 'Password reset link sent to email',
    resetToken: process.env.NODE_ENV === 'development' ? result.resetToken : undefined,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await AuthService.resetPassword(token, newPassword);

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});