/**
 * npm run setup
 *
 * One-time project setup:
 *   1. Starts PostgreSQL (embedded mode) if it is not already running
 *   2. Applies all database migrations (creates the database if needed)
 *   3. Seeds the demo restaurant (development only)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { isPortOpen, parseDbUrl, projectRoot, serverRoot, startEmbeddedPostgres, useEmbedded } from './embedded-db.js';

function run(cmd: string) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: serverRoot, stdio: 'inherit', env: process.env });
}

async function main() {
  if (!fs.existsSync(path.join(projectRoot, '.env'))) {
    console.error('❌ No .env file found. Copy .env.example to .env first (see README).');
    process.exit(1);
  }
  const { port } = parseDbUrl(process.env.DATABASE_URL ?? '');

  let stop: (() => Promise<void>) | undefined;
  if (useEmbedded() && !(await isPortOpen(port))) {
    console.log('[setup] Starting embedded PostgreSQL…');
    ({ stop } = await startEmbeddedPostgres());
  } else if (!(await isPortOpen(port))) {
    console.error(`❌ PostgreSQL is not reachable on port ${port}. Start your database first.`);
    process.exit(1);
  }

  try {
    try {
      run('npx prisma generate');
    } catch {
      // On Windows the engine file is locked while the app is running.
      console.warn('\n⚠️  prisma generate failed (is `npm run dev` running?). Continuing with the existing client.');
    }
    run('npx prisma migrate deploy');
    if (process.env.NODE_ENV !== 'production') run('npx tsx prisma/seed.ts');
    console.log('\n✅ Setup complete. Start developing with:  npm run dev');
  } finally {
    if (stop) await stop();
  }
}

main().catch((err) => {
  console.error('❌ Setup failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
