import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import { Role, User } from '../../generated/prisma/client.js';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { providerFromFirebase, verifyFirebaseToken } from '../config/firebase.js';
import { PublicUser, userModel } from '../models/userModel.js';
import { AppError } from '../utils/errorHandler.js';

const PUBLIC_ROLES = ['admin', 'employer', 'recruiter'] as const;
type PublicRole = (typeof PUBLIC_ROLES)[number];

type SessionUser = Pick<User, 'id' | 'fullName' | 'email' | 'role' | 'status' | 'provider'>;

type RegisterInput = {
  email: string;
  password: string;
  role: PublicRole;
  fullName?: string;
};

function toAuthUser(user: SessionUser) {
  return {
    id: user.id,
    name: user.fullName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    provider: user.provider,
  };
}

function clientMeta(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  };
}

function isPublicRole(role: string): role is PublicRole {
  return PUBLIC_ROLES.includes(role as PublicRole);
}

export class AuthService {
  static async issueSession(user: SessionUser, req: Request, action: string) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresDays);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        ...clientMeta(req),
      },
    });

    return { user: toAuthUser(user), accessToken, refreshToken };
  }

  static resolveSignupRole(role: unknown): PublicRole {
    if (typeof role !== 'string' || !role) {
      throw new AppError('Please choose an account type', 400);
    }
    if (!isPublicRole(role)) {
      throw new AppError('Role must be admin, employer, or recruiter', 400);
    }
    return role;
  }

  static async register(userData: RegisterInput, req: Request) {
    const { email, password } = userData;
    const role = AuthService.resolveSignupRole(userData.role);
    const fullName = userData.fullName?.trim() || '';

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      provider: 'local',
    });

    return AuthService.issueSession(user, req, 'REGISTER');
  }

  static async login(email: string, password: string, req: Request) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status !== 'active') {
      throw new AppError(`Account is ${user.status}. Please contact support.`, 403);
    }

    if (!user.password) {
      throw new AppError(`This account uses ${user.provider} sign-in`, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    return AuthService.issueSession(user, req, 'LOGIN');
  }

  static async oauth(idToken: string, role: unknown, req: Request) {
    const decoded = await verifyFirebaseToken(idToken);
    const provider = providerFromFirebase(decoded);
    const providerId = decoded.uid;
    const email = decoded.email;

    if (!email) {
      throw new AppError('OAuth account has no email', 400);
    }

    let user: User | PublicUser | null = await userModel.findByProvider(provider, providerId);
    if (!user) {
      user = await userModel.findByEmail(email);
    }

    if (!user) {
      user = await userModel.create({
        fullName: decoded.name || email.split('@')[0],
        email,
        password: null,
        role: AuthService.resolveSignupRole(role),
        provider,
        providerId,
      });
    } else if ('providerId' in user && !user.providerId) {
      user = await userModel.updateById(user.id, { provider, providerId });
    }

    if (user.status !== 'active') {
      throw new AppError(`Account is ${user.status}. Please contact support.`, 403);
    }

    return AuthService.issueSession(user, req, 'OAUTH_LOGIN');
  }

  static async refreshToken(oldToken: string, req: Request) {
    if (!oldToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    if (stored.user.status !== 'active') {
      throw new AppError(`Account is ${stored.user.status}. Please contact support.`, 403);
    }

    const session = await AuthService.issueSession(stored.user, req, 'TOKEN_REFRESH');
    await prisma.refreshToken.deleteMany({ where: { token: oldToken } });
    return session;
  }

  static async logout(userId: number | undefined, refreshToken: string | undefined, req: Request) {
    let id = userId;

    if (!id && refreshToken) {
      const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      id = stored?.userId;
    }

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    if (id) {
      await prisma.auditLog.create({
        data: {
          userId: id,
          action: 'LOGOUT',
          ...clientMeta(req),
        },
      });
    }

    return true;
  }

  static async updateProfile(userId: number, data: { fullName?: string; phone?: string }) {
    return userModel.updateById(userId, data);
  }

  static async getCurrentUser(userId: number) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async forgotPassword(email: string) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AppError('Email not found', 404);
    }

    if (!user.password) {
      throw new AppError(`This account uses ${user.provider} sign-in`, 400);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    await userModel.updateById(user.id, { resetToken, resetTokenExpiry });
    return { resetToken, email };
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await userModel.updateById(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return true;
  }
}

export type { Role };
