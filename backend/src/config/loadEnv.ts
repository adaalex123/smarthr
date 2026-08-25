import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let loadedEnv: { envName: string; envPath: string; rootDir: string } | null = null;

function resolveEnvName(): string {
  const fromArg = process.argv.find((arg) => arg.startsWith('--env='));
  if (fromArg) return fromArg.slice('--env='.length);
  return process.env.NODE_ENV || 'development';
}

export function loadEnv() {
  if (loadedEnv) return loadedEnv;

  const envName = resolveEnvName();
  process.env.NODE_ENV = envName;

  const envPath = path.join(rootDir, `.env.${envName}`);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    const fallbackEnvPath = path.join(rootDir, '.env');
    if (fs.existsSync(fallbackEnvPath)) {
      dotenv.config({ path: fallbackEnvPath });
    }
  }

  loadedEnv = { envName, envPath, rootDir };
  return loadedEnv;
}

export { rootDir };
