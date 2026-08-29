import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import { Role } from '../../generated/prisma/client.js';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { providerFromFirebase, verifyFirebaseToken } from '../config/firebase.js';
import { PublicUser, publicUserSelect, userModel } from '../models/userModel.js';
import { RecruiterProfileInput, recruiterProfileModel } from '../models/recruiterProfileModel.js';
import { canonicalizeRole, isHiringRole } from '../types/auth.js';
import { AppError } from '../utils/errorHandler.js';

const PUBLIC_ROLES = ['admin', 'employer', 'recruiter', 'candidate'] as const;
type PublicRole = (typeof PUBLIC_ROLES)[number];

type SessionUser = PublicUser;

type RegisterInput = {
  email: string;
  password: string;
  role: PublicRole;
  fullName?: string;
  phone?: string;
  country?: string;
  recruiterProfile?: RecruiterProfileInput;
};

function normalizeRecruiterProfile(data: RegisterInput['recruiterProfile']): RecruiterProfileInput {
  if (!data?.companyName?.trim()) {
    throw new AppError('Company name is required for recruiter accounts', 400);
  }
  if (!data.industry?.trim()) {
    throw new AppError('Industry is required for recruiter accounts', 400);
  }
  if (!data.jobTitle?.trim()) {
    throw new AppError('Recruiter role is required for recruiter accounts', 400);
  }
  if (!data.country?.trim()) {
    throw new AppError('Country is required for recruiter accounts', 400);
  }

  return {
    companyName: data.companyName.trim(),
    companyWebsite: data.companyWebsite?.trim() || null,
    industry: data.industry.trim(),
    jobTitle: data.jobTitle.trim(),
    country: data.country.trim(),
    linkedIn: data.linkedIn?.trim() || null,
  };
}

function toAuthUser(user: SessionUser) {
  return {
    id: user.id,
    name: user.fullName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    provider: user.provider,
    recruiterProfile: user.recruiterProfile,
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

function resolveOauthRole(role: unknown): PublicRole {
  if (role === undefined || role === null || role === '') {
    return 'candidate';
  }
  if (typeof role !== 'string' || !isPublicRole(role)) {
    throw new AppError('Role must be candidate, recruiter, or admin', 400);
  }
  return canonicalizeRole(role);
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
      throw new AppError('Role must be candidate, recruiter, or admin', 400);
    }
    return canonicalizeRole(role);
  }

  static async register(userData: RegisterInput, req: Request) {
    const { email, password } = userData;
    const role = AuthService.resolveSignupRole(userData.role);
    const fullName = userData.fullName?.trim() || '';
    const phone = userData.phone?.trim() || null;

    if (isHiringRole(role)) {
      if (fullName.length < 2) {
        throw new AppError('Full name is required for recruiter accounts', 400);
      }
      if (!phone) {
        throw new AppError('Phone number is required for recruiter accounts', 400);
      }
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const recruiterProfile = isHiringRole(role)
      ? normalizeRecruiterProfile(userData.recruiterProfile)
      : null;

    const user = await userModel.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      provider: 'local',
      ...(recruiterProfile
        ? { recruiterProfile: { create: recruiterProfile } }
        : {}),
    });

    return AuthService.issueSession(user, req, 'REGISTER');
  }

  static async login(email: string, password: string, req: Request) {
    const user = await userModel.findAuthByEmail(email);
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

    let user: PublicUser | Awaited<ReturnType<typeof userModel.findAuthByProvider>> =
      await userModel.findAuthByProvider(provider, providerId);
    if (!user) {
      user = await userModel.findAuthByEmail(email);
    }

    if (!user) {
      user = await userModel.create({
        fullName: decoded.name || email.split('@')[0],
        email,
        password: null,
        role: resolveOauthRole(role),
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
      include: { user: { select: publicUserSelect } },
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

  static async updateProfile(
    userId: number,
    data: {
      fullName?: string;
      phone?: string;
      recruiterProfile?: RecruiterProfileInput;
    }
  ) {
    const existing = await userModel.findById(userId);
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    const user = await userModel.updateById(userId, {
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    });

    if (isHiringRole(existing.role) && data.recruiterProfile) {
      const profile = normalizeRecruiterProfile(data.recruiterProfile);
      await recruiterProfileModel.upsert(userId, profile);
      const refreshed = await userModel.findById(userId);
      if (!refreshed) throw new AppError('User not found', 404);
      return refreshed;
    }

    return user;
  }

  static async getCurrentUser(userId: number) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async forgotPassword(email: string) {
    const user = await userModel.findAuthByEmail(email);
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
