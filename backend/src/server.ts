import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve Frontend dist for SPA fallback (works for both dev src/ and built dist/src/)
function resolveFrontendDist(): string | null {
  const candidates = [
    path.resolve(__dirname, '../../Frontend/dist'), // src/ -> project/Frontend/dist (dev)
    path.resolve(__dirname, '../../../Frontend/dist'), // dist/src/ -> project/Frontend/dist (built)
    path.resolve(process.cwd(), 'Frontend/dist'), // cwd = project root
    path.resolve(process.cwd(), '../Frontend/dist'), // cwd = backend
  ];
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) return p;
  }
  return null;
}
const frontendDist = resolveFrontendDist();

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

const authEntryPaths = new Set([
  `${apiBase}/auth/login`,
  `${apiBase}/auth/oauth`,
  `${apiBase}/auth/signup`,
  `${apiBase}/auth/register`,
]);

app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  skip: (req) => authEntryPaths.has(req.path),
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

const signupLimiter = rateLimit({
  windowMs: config.signupRateLimit.windowMs,
  max: config.signupRateLimit.max,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many signup attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(`${apiBase}/auth/signup`, signupLimiter);
app.use(`${apiBase}/auth/register`, signupLimiter);

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

// SPA fallback: serve Frontend build if present
if (frontendDist) {
  console.log(`Serving Frontend from ${frontendDist}`);
  app.use(express.static(frontendDist, { maxAge: '1d', index: false }));
  // Fallback to index.html for client-side routing (e.g. /candidate, /employer, /admin on refresh)
  app.get('*', (req, res, next) => {
    // Only handle GET that accepts html and is not an API/health request
    if (req.method !== 'GET' || req.path.startsWith(apiBase) || req.path === '/health' || req.path.startsWith('/api/')) {
      return next();
    }
    const acceptsHtml = req.accepts('html');
    if (!acceptsHtml) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  console.log('Frontend dist not found - SPA fallback disabled. API-only mode.');
}

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
