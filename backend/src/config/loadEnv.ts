import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function resolveEnvName(): string {
  const fromArg = process.argv.find((arg) => arg.startsWith('--env='));
  if (fromArg) return fromArg.slice('--env='.length);
  return process.env.NODE_ENV || 'development';
}

export function loadEnv() {
  const envName = resolveEnvName();
  process.env.NODE_ENV = envName;

  const envPath = path.join(rootDir, `.env.${envName}`);
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing environment file: ${envPath}`);
  }

  dotenv.config({ path: envPath });
  return { envName, envPath, rootDir };
}

export { rootDir };
