import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { sha256 } from '../src/utils/tokens.js';
import { makeApp, ORIGIN, registeredClient, TestClient, uniqueEmail, VALID_PASSWORD } from './helpers.js';

const app = makeApp();

describe('GET /api/health', () => {
  it('reports the API and database as healthy', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('returns a JSON 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/does-not-exist').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Registration', () => {
  it('creates a user, hashes the password and starts a session', async () => {
    const client = await TestClient.create(app);
    const email = uniqueEmail();
    const res = await client.post('/api/auth/register', { name: 'Ayesha Khan', email, password: VALID_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Ayesha Khan', email, platformRole: 'USER' });
    expect(res.body.user.passwordHash).toBeUndefined();

    const cookie = res.headers['set-cookie']?.toString() ?? '';
    expect(cookie).toMatch(/df_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(stored.passwordHash).not.toContain(VALID_PASSWORD);
    expect(stored.passwordHash.startsWith('scrypt$')).toBe(true);
    expect(await prisma.session.count({ where: { userId: stored.id } })).toBe(1);
  });

  it('normalises the email to lowercase', async () => {
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/register', {
      name: 'Case Test',
      email: '  MiXeD.Case@Example.COM ',
      password: VALID_PASSWORD,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('mixed.case@example.com');
  });

  it('prevents duplicate emails (case-insensitive) with 409', async () => {
    const { email } = await registeredClient(app);
    const other = await TestClient.create(app);
    const res = await other.post('/api/auth/register', {
      name: 'Someone Else',
      email: email.toUpperCase(),
      password: VALID_PASSWORD,
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
    expect(await prisma.user.count({ where: { email } })).toBe(1);
  });

  it('validates input and returns field errors', async () => {
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/register', { name: 'A', email: 'not-an-email', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(res.body.error.details.fields)).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
  });

  it('ignores attempts to self-assign SUPER_ADMIN', async () => {
    const client = await TestClient.create(app);
    const email = uniqueEmail();
    const res = await client.post('/api/auth/register', {
      name: 'Sneaky User',
      email,
      password: VALID_PASSWORD,
      platformRole: 'SUPER_ADMIN',
      role: 'SUPER_ADMIN',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.platformRole).toBe('USER');
    const stored = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(stored.platformRole).toBe('USER');
  });
});

describe('Login', () => {
  it('signs in with correct credentials', async () => {
    const { email } = await registeredClient(app);
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/login', { email, password: VALID_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']?.toString()).toMatch(/df_session=/);

    const me = await client.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  it('rejects a wrong password with a generic message', async () => {
    const { email } = await registeredClient(app);
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/login', { email, password: 'WrongPass123' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects an unknown email with the same generic message', async () => {
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/login', { email: uniqueEmail('ghost'), password: VALID_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rate-limits repeated login attempts', async () => {
    const limitedApp = makeApp({ loginRateLimit: { max: 3, windowMs: 60_000 } });
    const client = await TestClient.create(limitedApp);
    const body = { email: uniqueEmail('brute'), password: 'Wrong12345' };
    for (let i = 0; i < 3; i++) {
      expect((await client.post('/api/auth/login', body)).status).toBe(401);
    }
    const blocked = await client.post('/api/auth/login', body);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});

describe('Session validation', () => {
  it('returns 401 from /me without a session', async () => {
    const res = await request(app).get('/api/auth/me').expect(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a forged session cookie', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', 'df_session=forged-token-value-1234567890abcdef');
    expect(res.status).toBe(401);
  });

  it('rejects an expired session and deletes it', async () => {
    const { client, user } = await registeredClient(app);
    await prisma.session.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await client.get('/api/auth/me')).status).toBe(401);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  });

  it('stores only a hash of the session token', async () => {
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/register', {
      name: 'Hash Check',
      email: uniqueEmail(),
      password: VALID_PASSWORD,
    });
    const token = /df_session=([^;]+)/.exec(res.headers['set-cookie']!.toString())![1]!;
    const session = await prisma.session.findFirstOrThrow({ where: { userId: res.body.user.id } });
    expect(session.tokenHash).toBe(sha256(token));
    expect(session.tokenHash).not.toBe(token);
  });
});

describe('Logout', () => {
  it('destroys the server-side session and clears the cookie', async () => {
    const { client, user } = await registeredClient(app);
    const res = await client.post('/api/auth/logout');
    expect(res.status).toBe(204);
    expect(res.headers['set-cookie']?.toString()).toMatch(/df_session=;/);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
    expect((await client.get('/api/auth/me')).status).toBe(401);
  });

  it('cannot be replayed with the old cookie', async () => {
    const { client } = await registeredClient(app);
    const cookieJar = (await client.get('/api/auth/me')).request.cookies as unknown as string;
    await client.post('/api/auth/logout');
    const replay = await request(app).get('/api/auth/me').set('Cookie', cookieJar);
    expect(replay.status).toBe(401);
  });
});

describe('CSRF protection', () => {
  it('rejects state-changing requests without a CSRF token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail(), password: VALID_PASSWORD });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_INVALID');
  });

  it('rejects a forged CSRF token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Cookie', 'df_csrf=abc.def')
      .set('x-csrf-token', 'abc.def')
      .send({ email: uniqueEmail(), password: VALID_PASSWORD });
    expect(res.status).toBe(403);
  });

  it('rejects requests from a foreign origin', async () => {
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/login', { email: uniqueEmail(), password: VALID_PASSWORD }, {
      origin: 'https://evil.example',
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_ORIGIN_MISMATCH');
  });

  it('allows requests from the configured origin', async () => {
    const client = await TestClient.create(app);
    const res = await client.post('/api/auth/login', { email: uniqueEmail(), password: VALID_PASSWORD }, {
      origin: ORIGIN,
    });
    expect(res.status).toBe(401); // passes CSRF, fails on credentials
  });
});

describe('Profile', () => {
  it('lets a user update their own name', async () => {
    const { client } = await registeredClient(app);
    const res = await client.patch('/api/auth/me', { name: 'Renamed Owner' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Renamed Owner');
  });

  it('changes the password and signs out other sessions', async () => {
    const { client, email, user } = await registeredClient(app);
    const second = await TestClient.create(app);
    await second.post('/api/auth/login', { email, password: VALID_PASSWORD }).expect(200);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(2);

    const res = await client.post('/api/auth/change-password', {
      currentPassword: VALID_PASSWORD,
      newPassword: 'BrandNew123',
    });
    expect(res.status).toBe(200);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(1);
    expect((await second.get('/api/auth/me')).status).toBe(401);

    const fresh = await TestClient.create(app);
    expect((await fresh.post('/api/auth/login', { email, password: VALID_PASSWORD })).status).toBe(401);
    expect((await fresh.post('/api/auth/login', { email, password: 'BrandNew123' })).status).toBe(200);
  });

  it('rejects a wrong current password', async () => {
    const { client } = await registeredClient(app);
    const res = await client.post('/api/auth/change-password', {
      currentPassword: 'NotMyPassword1',
      newPassword: 'BrandNew123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
  });
});
