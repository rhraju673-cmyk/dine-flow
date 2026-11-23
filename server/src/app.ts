/**
 * Builds the Express application. Kept separate from index.ts so tests can
 * create an app instance without opening a network port.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { appConfig } from './config/app.config.js';
import { allowedOrigins, isProduction } from './config/env.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { loadSession } from './middleware/session.js';
import { apiRoutes } from './routes/index.js';
import type { AuthRouteOptions } from './routes/auth.routes.js';

export interface CreateAppOptions extends Partial<AuthRouteOptions> {
  /** Serve the built React app (client/dist) from this server. Default: production only. */
  serveClient?: boolean;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  // Behind a reverse proxy (Nginx, Render, Railway...) this makes req.ip and
  // "secure" cookies work correctly. Adjust if you have several proxies.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // ── API ─────────────────────────────────────────────────
  app.use('/api', loadSession, csrfProtection);
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); // never cache private API data
    next();
  });
  app.use(
    '/api',
    apiRoutes({
      loginRateLimit: options.loginRateLimit ?? appConfig.rateLimit.login,
      registerRateLimit: options.registerRateLimit ?? appConfig.rateLimit.register,
    }),
  );
  app.use('/api', notFoundHandler);

  // ── Frontend (production) ───────────────────────────────
  const serveClient = options.serveClient ?? isProduction;
  const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  if (serveClient && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    // React Router handles every other path
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
