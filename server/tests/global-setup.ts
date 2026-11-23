/**
 * Runs once before the whole test suite:
 *   • makes sure PostgreSQL is reachable (starts the embedded one if needed)
 *   • applies all migrations to the TEST database (created automatically)
 */
import { execSync } from 'node:child_process';
import { isPortOpen, parseDbUrl, serverRoot, startEmbeddedPostgres, useEmbedded } from '../scripts/embedded-db.js';

export default async function globalSetup() {
  const testUrl = process.env.TEST_DATABASE_URL!;
  const { port } = parseDbUrl(testUrl);

  let stop: (() => Promise<void>) | undefined;
  if (!(await isPortOpen(port))) {
    if (!useEmbedded()) throw new Error(`PostgreSQL is not reachable on port ${port}. Start it before running tests.`);
    ({ stop } = await startEmbeddedPostgres());
  }

  execSync('npx prisma migrate deploy', {
    cwd: serverRoot,
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: testUrl },
  });

  return async () => {
    if (stop) await stop();
  };
}
