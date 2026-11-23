/**
 * Helpers to run a REAL PostgreSQL 17 server locally without installing it.
 *
 * Uses the "embedded-postgres" npm package, which ships the official
 * PostgreSQL binaries. Data is stored in  dineflow/.data/postgres
 * The user, password and port are taken from DATABASE_URL in .env.
 *
 * If you prefer your own PostgreSQL (installed, Docker, cloud), set
 * USE_EMBEDDED_POSTGRES=false in .env and these helpers are not used.
 */
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import EmbeddedPostgres from 'embedded-postgres';

const here = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(here, '../..');
export const serverRoot = path.resolve(here, '..');
dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });

export const dataDir = path.join(projectRoot, '.data', 'postgres');

export function parseDbUrl(url: string) {
  const u = new URL(url);
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: Number(u.port || 5432),
    database: u.pathname.replace(/^\//, ''),
  };
}

/** Resolves true if something is accepting TCP connections on host:port. */
export function isPortOpen(port: number, host = '127.0.0.1', timeoutMs = 800): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const done = (open: boolean) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

export function useEmbedded(): boolean {
  return ['true', '1'].includes(String(process.env.USE_EMBEDDED_POSTGRES).toLowerCase());
}

/**
 * Starts the embedded PostgreSQL server (initialising it on first run).
 * Returns a stop() function. The server stops automatically when the
 * Node process exits.
 */
export async function startEmbeddedPostgres(options: { verbose?: boolean } = {}) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing in .env');
  const { user, password, port, host } = parseDbUrl(databaseUrl);
  if (!['localhost', '127.0.0.1'].includes(host)) {
    throw new Error(`Embedded PostgreSQL only runs on localhost, but DATABASE_URL points to "${host}".`);
  }

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user,
    password,
    port,
    persistent: true,
    // UTF-8 everywhere so Bangla, Hindi and every other script store correctly.
    initdbFlags: ['--encoding=UTF8', '--no-locale'],
    onLog: (msg: string) => {
      if (options.verbose) process.stdout.write(`[postgres] ${msg}`);
    },
    onError: (err: unknown) => {
      const text = err instanceof Error ? err.message : String(err);
      if (options.verbose || /FATAL|PANIC/.test(text)) process.stderr.write(`[postgres] ${text}\n`);
    },
  });

  const initialised = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (!initialised) {
    console.log(`[db] First run: creating a new PostgreSQL cluster in ${path.relative(projectRoot, dataDir)} …`);
    fs.mkdirSync(path.dirname(dataDir), { recursive: true });
    await pg.initialise();
  }

  await pg.start();
  return { pg, port, stop: () => pg.stop() };
}
