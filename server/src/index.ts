import { env } from './config/env.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { purgeExpiredSessions } from './services/session.service.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🍽️  DineFlow API running on http://localhost:${env.PORT}  (${env.NODE_ENV})`);
});

// Remove expired sessions every hour.
const purgeTimer = setInterval(
  () => {
    purgeExpiredSessions().catch((err) => console.warn('[sessions] purge failed:', err.message));
  },
  60 * 60 * 1000,
);
purgeTimer.unref();

async function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down…`);
  clearInterval(purgeTimer);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
