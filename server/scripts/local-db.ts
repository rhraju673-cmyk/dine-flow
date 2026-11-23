/**
 * npm run db:start
 *
 * Runs the local embedded PostgreSQL server in the foreground.
 * Keep this terminal open while you develop. Press Ctrl+C to stop.
 * (`npm run dev` already starts it for you together with the API and web app.)
 */
import { isPortOpen, parseDbUrl, startEmbeddedPostgres, useEmbedded } from './embedded-db.js';

async function main() {
  if (!useEmbedded()) {
    console.log('[db] USE_EMBEDDED_POSTGRES=false — using your own PostgreSQL server (nothing to start).');
    // Stay alive so `npm run dev` (concurrently -k) doesn't stop the other processes.
    setInterval(() => undefined, 1 << 30);
    return;
  }

  const { port } = parseDbUrl(process.env.DATABASE_URL ?? '');
  if (await isPortOpen(port)) {
    console.log(`[db] Something is already listening on port ${port} — assuming PostgreSQL is running.`);
    setInterval(() => undefined, 1 << 30);
    return;
  }

  const { stop } = await startEmbeddedPostgres();
  console.log(`[db] ✅ PostgreSQL is running on localhost:${port}  (Ctrl+C to stop)`);

  const shutdown = async () => {
    console.log('\n[db] Stopping PostgreSQL…');
    await stop().catch(() => undefined);
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  setInterval(() => undefined, 1 << 30); // keep the process alive
}

main().catch((err) => {
  console.error('[db] ❌ Could not start PostgreSQL:', err instanceof Error ? err.message : err);
  process.exit(1);
});
