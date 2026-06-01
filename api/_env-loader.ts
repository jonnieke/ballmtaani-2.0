/**
 * Load environment variables from .env file for serverless functions in local dev
 * This ensures WIF and API keys are available to functions
 */
import fs from 'fs';
import path from 'path';

export function loadEnv() {
  // In production (Vercel), env vars come from dashboard — don't override
  if (process.env.VERCEL === 'true') return;

  // In local dev, find .env.local in repo root or artifacts/ballmtaani
  const candidates = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), 'artifacts', 'ballmtaani', '.env.local'),
    path.join(process.cwd(), '.env'),
  ];
  const envFile = candidates.find(f => fs.existsSync(f));
  if (!envFile) return;

  try {
    const content = fs.readFileSync(envFile as string, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        // Only set if not already defined (don't override Vercel dashboard vars)
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (err) {
    // If .env doesn't exist or can't be read, continue anyway
    // Vercel will provide env vars from dashboard
  }
}
