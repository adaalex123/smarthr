// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './utils/errorHandler.js';
import { securityConfig } from './config/security.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: securityConfig.cors.origin,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Login-specific rate limiting (stricter)
const loginLimiter = rateLimit({
  windowMs: securityConfig.loginRateLimit.windowMs,
  max: securityConfig.loginRateLimit.max,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SmartHR Auth Service',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartHR Auth Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

export default app;