import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

const app = express();
const apiBase = `/api/${config.apiVersion}`;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
}));

const loginLimiter = rateLimit({
  windowMs: config.loginRateLimit.windowMs,
  max: config.loginRateLimit.max,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(`${apiBase}/auth/login`, loginLimiter);
app.use(`${apiBase}/auth/oauth`, loginLimiter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: config.appName,
    env: config.env,
    apiVersion: config.apiVersion,
  });
});

app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/employer`, employerRoutes);
app.use(`${apiBase}/candidate`, candidateRoutes);
app.use(`${apiBase}/recruiter`, recruiterRoutes);
app.use(`${apiBase}/admin`, adminRoutes);
app.use(`${apiBase}/jobs`, jobRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`${config.appName} running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`API base: http://localhost:${config.port}${apiBase}`);
});

export default app;
