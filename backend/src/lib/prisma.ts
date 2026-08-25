import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { loadEnv } from '../config/loadEnv.js';

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing required env var DATABASE_URL');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const isDev = process.env.NODE_ENV !== 'production';

export const prisma = new PrismaClient({
  adapter,
  log: isDev ? ['query', 'error', 'warn'] : ['error'],
});
