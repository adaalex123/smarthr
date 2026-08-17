import { Response } from 'express';
import { config } from '../config/index.js';

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const { cookie } = config;

  res.cookie('accessToken', accessToken, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    maxAge: cookie.maxAge,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    maxAge: cookie.refreshMaxAge,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('token');
  res.clearCookie('refreshToken');
}
