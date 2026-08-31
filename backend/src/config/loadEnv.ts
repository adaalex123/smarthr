import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function resolveRootDir(): string {
  const candidates = [
    process.cwd(),
    path.resolve(moduleDir, '../..'),
    path.resolve(moduleDir, '../../..'),
  ];

  return candidates.find((candidate) => fs.existsSync(path.join(candidate, 'package.json')))
    || path.resolve(moduleDir, '../..');
}

const rootDir = resolveRootDir();
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

  const preferredEnvPath = path.join(rootDir, `.env.${envName}`);
  let envPath = preferredEnvPath;

  if (fs.existsSync(preferredEnvPath)) {
    dotenv.config({ path: preferredEnvPath });
  } else {
    const fallbackEnvPath = path.join(rootDir, '.env');
    if (fs.existsSync(fallbackEnvPath)) {
      dotenv.config({ path: fallbackEnvPath });
      envPath = fallbackEnvPath;
    }
  }

  loadedEnv = { envName, envPath, rootDir };
  return loadedEnv;
}

export { rootDir };
