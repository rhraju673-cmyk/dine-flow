import type { Express } from 'express';
import request from 'supertest';
import { createApp, type CreateAppOptions } from '../src/app.js';

export const ORIGIN = 'http://localhost:5173';

export function makeApp(options: CreateAppOptions = {}) {
  return createApp({
    loginRateLimit: { max: 1000, windowMs: 60_000 },
    registerRateLimit: { max: 1000, windowMs: 60_000 },
    ...options,
  });
}

/**
 * A browser-like test client: keeps cookies between requests and sends the
 * CSRF token header automatically, just like the real frontend does.
 */
export class TestClient {
  readonly agent: ReturnType<typeof request.agent>;
  private csrfToken = '';

  constructor(app: Express) {
    this.agent = request.agent(app);
  }

  static async create(app: Express) {
    const client = new TestClient(app);
    const res = await client.agent.get('/api/auth/csrf').expect(200);
    client.csrfToken = res.body.csrfToken;
    return client;
  }

  get(url: string, headers: Record<string, string> = {}) {
    return this.agent.get(url).set(headers);
  }
  post(url: string, body: object = {}, headers: Record<string, string> = {}) {
    return this.agent.post(url).set({ 'x-csrf-token': this.csrfToken, origin: ORIGIN, ...headers }).send(body);
  }
  patch(url: string, body: object = {}, headers: Record<string, string> = {}) {
    return this.agent.patch(url).set({ 'x-csrf-token': this.csrfToken, origin: ORIGIN, ...headers }).send(body);
  }
}

let counter = 0;
export function uniqueEmail(prefix = 'user') {
  counter += 1;
  return `${prefix}.${Date.now()}.${counter}@example.com`;
}

export const VALID_PASSWORD = 'Sup3rSecret!';

export const validRestaurant = {
  name: 'Spice Garden',
  category: 'CASUAL_DINING',
  phone: '+880 1700-123456',
  email: 'contact@spicegarden.example',
  address: '22 Lake Road, Dhanmondi, Dhaka',
  country: 'BD',
  currency: 'BDT',
  timezone: 'Asia/Dhaka',
};

/** Registers a new user and returns a signed-in client. */
export async function registeredClient(app: Express, name = 'Test Owner') {
  const client = await TestClient.create(app);
  const email = uniqueEmail();
  const res = await client.post('/api/auth/register', { name, email, password: VALID_PASSWORD });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { client, email, user: res.body.user as { id: string; email: string } };
}

/** Registers a user AND creates a restaurant for them. */
export async function ownerWithRestaurant(app: Express, restaurantName = 'Spice Garden') {
  const ctx = await registeredClient(app);
  const res = await ctx.client.post('/api/restaurants', { ...validRestaurant, name: restaurantName });
  if (res.status !== 201) throw new Error(`create restaurant failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { ...ctx, restaurant: res.body.restaurant as { id: string; name: string; slug: string } };
}
