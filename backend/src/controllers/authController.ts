import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { clearAuthCookies, setAuthCookies } from '../utils/authCookies.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/errorHandler.js';

type SessionResult = {
  user: unknown;
  accessToken: string;
  refreshToken: string;
};

function sendSession(res: Response, result: SessionResult, status = 200) {
  setAuthCookies(res, result.accessToken, result.refreshToken);
  return res.status(status).json({
    success: true,
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
}

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body, req);
  return sendSession(res, result, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await AuthService.login(email, password, req);
  return sendSession(res, result);
});

export const oauth = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body as { idToken: string; role?: string };
  const result = await AuthService.oauth(idToken, role, req);
  return sendSession(res, result);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = (req.body as { refreshToken?: string }).refreshToken || req.cookies?.refreshToken;
  const result = await AuthService.refreshToken(token, req);
  return sendSession(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  const token = (req.body as { refreshToken?: string }).refreshToken || req.cookies?.refreshToken;
  await AuthService.logout(req.user?.id, token, req);
  clearAuthCookies(res);
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const user = await AuthService.getCurrentUser(req.user.id);
  res.json({
    success: true,
    user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { fullName, phone, recruiterProfile } = req.body as {
    fullName?: string;
    phone?: string;
    recruiterProfile?: {
      companyName: string;
      companyWebsite?: string;
      industry: string;
      jobTitle: string;
      country: string;
      linkedIn?: string;
    };
  };
  const user = await AuthService.updateProfile(req.user.id, { fullName, phone, recruiterProfile });
  res.json({
    success: true,
    user,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword((req.body as { email: string }).email);
  res.json({
    success: true,
    message: 'Password reset link sent to email',
    resetToken: config.env === 'development' ? result.resetToken : undefined,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body as { token: string; newPassword: string };
  await AuthService.resetPassword(token, newPassword);
  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});
