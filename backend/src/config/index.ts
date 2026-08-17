import path from 'path';
import { loadEnv, rootDir } from './loadEnv.js';

const { envName } = loadEnv();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} in .env.${envName}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function parseOrigin(value: string): string | string[] {
  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
}

const refreshExpiresDays = parseInt(optional('JWT_REFRESH_EXPIRES_DAYS', '7'), 10);

export const config = {
  env: envName,
  isProduction: envName === 'production',
  port: parseInt(required('PORT'), 10),
  apiVersion: required('API_VERSION'),
  appName: optional('APP_NAME', 'SmartHR'),
  database: {
    url: required('DATABASE_URL'),
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '24h'),
    refreshExpiresDays,
  },
  bcrypt: {
    saltRounds: parseInt(optional('BCRYPT_SALT_ROUNDS', '10'), 10),
  },
  cookie: {
    httpOnly: optional('COOKIE_HTTPONLY', 'true') === 'true',
    secure: optional('COOKIE_SECURE', 'false') === 'true',
    sameSite: optional('COOKIE_SAMESITE', 'lax') as 'lax' | 'strict' | 'none',
    maxAge: parseInt(optional('COOKIE_MAX_AGE_MS', String(24 * 60 * 60 * 1000)), 10),
    refreshMaxAge: refreshExpiresDays * 24 * 60 * 60 * 1000,
  },
  cors: {
    origin: parseOrigin(required('CORS_ORIGIN')),
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', String(15 * 60 * 1000)), 10),
    max: parseInt(optional('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },
  loginRateLimit: {
    windowMs: parseInt(optional('LOGIN_RATE_LIMIT_WINDOW_MS', String(15 * 60 * 1000)), 10),
    max: parseInt(optional('LOGIN_RATE_LIMIT_MAX', '5'), 10),
  },
  firebase: {
    serviceAccount: path.resolve(rootDir, required('FIREBASE_SERVICE_ACCOUNT')),
  },
};
