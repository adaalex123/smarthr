import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const isDev = process.env.NODE_ENV !== 'production';

export const prisma = new PrismaClient({
  adapter,
  log: isDev ? ['query', 'error', 'warn'] : ['error'],
});
