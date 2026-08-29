import { defineConfig, env } from 'prisma/config';
import { loadEnv } from './src/config/loadEnv.js';

loadEnv();

function withSslMode(url: string) {
  if (url.includes('sslmode=')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;
}

const datasourceUrl = process.env.DIRECT_URL
  ? withSslMode(process.env.DIRECT_URL)
  : env('DATABASE_URL');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: datasourceUrl,
  },
});
