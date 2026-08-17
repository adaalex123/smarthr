// src/services/authService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { securityConfig } from '../config/security.js';
import { AppError } from '../utils/errorHandler.js';

export class AuthService {
  static async register(userData) {
    const { fullName, email, phone, password, role = 'candidate' } = userData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, securityConfig.bcrypt.saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(email, password, req) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check user status
    if (user.status !== 'active') {
      throw new AppError(`Account is ${user.status}. Please contact support.`, 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.expiresIn,
    });

    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    // Prepare response
    const userData = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
    };

    return { user: userData, token, refreshToken };
  }

  static async refreshToken(oldToken, req) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Generate new JWT
    const payload = {
      id: refreshToken.user.id,
      email: refreshToken.user.email,
      role: refreshToken.user.role,
    };

    const newToken = jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.expiresIn,
    });

    return { token: newToken };
  }

  static async logout(userId, refreshToken, req) {
    // Delete refresh token
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    return true;
  }

  static async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Email not found', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour

    // Store reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In production, send email with reset link
    // For demo, we return the token
    return { resetToken, email };
  }

  static async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, securityConfig.bcrypt.saltRounds);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return true;
  }
}