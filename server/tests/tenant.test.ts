/**
 * CROSS-TENANT ACCESS PREVENTION
 * One restaurant must never be able to read or change another restaurant's data.
 */
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { makeApp, ownerWithRestaurant, registeredClient } from './helpers.js';

const app = makeApp();

describe('Protected routes', () => {
  it.each([
    ['get', '/api/auth/me'],
    ['get', '/api/restaurants/current'],
    ['get', '/api/dashboard/overview'],
    ['get', '/api/restaurants/some-id'],
  ] as const)('%s %s returns 401 without a session', async (method, url) => {
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('Tenant authorization', () => {
  it('owner can read their own restaurant by id', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const res = await a.client.get(`/api/restaurants/${a.restaurant.id}`);
    expect(res.status).toBe(200);
    expect(res.body.restaurant.name).toBe('Alpha Kitchen');
  });

  it('blocks reading another restaurant by id', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const b = await ownerWithRestaurant(app, 'Bravo Bistro');
    const res = await b.client.get(`/api/restaurants/${a.restaurant.id}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('TENANT_ACCESS_DENIED');
    expect(JSON.stringify(res.body)).not.toContain('Alpha Kitchen');
  });

  it('returns the same 403 for non-existent restaurants (no id probing)', async () => {
    const b = await ownerWithRestaurant(app, 'Bravo Bistro');
    const res = await b.client.get('/api/restaurants/clxxxxxxxxxxxxxxxxxxxxxxx');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('TENANT_ACCESS_DENIED');
  });

  it('blocks switching tenant with the X-Restaurant-Id header', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const b = await ownerWithRestaurant(app, 'Bravo Bistro');
    const read = await b.client.get('/api/restaurants/current', { 'x-restaurant-id': a.restaurant.id });
    expect(read.status).toBe(403);
    const dash = await b.client.get('/api/dashboard/overview', { 'x-restaurant-id': a.restaurant.id });
    expect(dash.status).toBe(403);
  });

  it('blocks updating another restaurant and leaves its data untouched', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const b = await ownerWithRestaurant(app, 'Bravo Bistro');
    const res = await b.client.patch(
      '/api/restaurants/current',
      { name: 'Hacked', settings: { taxRate: 99 } },
      { 'x-restaurant-id': a.restaurant.id },
    );
    expect(res.status).toBe(403);

    const alpha = await prisma.restaurant.findUniqueOrThrow({
      where: { id: a.restaurant.id },
      include: { settings: true },
    });
    expect(alpha.name).toBe('Alpha Kitchen');
    expect(alpha.settings?.taxRate.toNumber()).toBe(0);
  });

  it('blocks activating another restaurant on your session', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const b = await ownerWithRestaurant(app, 'Bravo Bistro');
    const res = await b.client.post(`/api/restaurants/${a.restaurant.id}/activate`);
    expect(res.status).toBe(403);
    const sessions = await prisma.session.findMany({ where: { userId: b.user.id } });
    expect(sessions.every((s) => s.activeRestaurantId === b.restaurant.id)).toBe(true);
  });

  it('ignores a tampered active-restaurant on the session', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const b = await ownerWithRestaurant(app, 'Bravo Bistro');
    // Simulate a corrupted session pointing at another tenant.
    await prisma.session.updateMany({ where: { userId: b.user.id }, data: { activeRestaurantId: a.restaurant.id } });
    const res = await b.client.get('/api/restaurants/current');
    expect(res.status).toBe(200);
    expect(res.body.restaurant.id).toBe(b.restaurant.id);
  });

  it('each owner only sees their own restaurant in /me', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    await ownerWithRestaurant(app, 'Bravo Bistro');
    const me = await a.client.get('/api/auth/me');
    expect(me.body.memberships).toHaveLength(1);
    expect(me.body.memberships[0].restaurant.name).toBe('Alpha Kitchen');
  });

  it('a user without a restaurant cannot access any restaurant', async () => {
    const a = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const { client } = await registeredClient(app);
    expect((await client.get(`/api/restaurants/${a.restaurant.id}`)).status).toBe(403);
    expect((await client.get('/api/dashboard/overview')).status).toBe(404);
  });
});

describe('Role-based permissions inside a restaurant', () => {
  async function addMember(restaurantId: string, role: 'WAITER' | 'RESTAURANT_MANAGER' | 'KITCHEN_STAFF') {
    const ctx = await registeredClient(app, `Staff ${role}`);
    await prisma.restaurantMembership.create({ data: { userId: ctx.user.id, restaurantId, role } });
    return ctx;
  }

  it('waiter can read but cannot update the restaurant', async () => {
    const owner = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const waiter = await addMember(owner.restaurant.id, 'WAITER');

    const read = await waiter.client.get('/api/restaurants/current');
    expect(read.status).toBe(200);
    expect(read.body.role).toBe('WAITER');

    const write = await waiter.client.patch('/api/restaurants/current', { name: 'Waiter Was Here' });
    expect(write.status).toBe(403);
    expect(write.body.error.code).toBe('INSUFFICIENT_ROLE');
  });

  it('waiter does not see subscription details on the dashboard', async () => {
    const owner = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const waiter = await addMember(owner.restaurant.id, 'WAITER');
    const res = await waiter.client.get('/api/dashboard/overview');
    expect(res.status).toBe(200);
    expect(res.body.subscription).toBeNull();
  });

  it('manager can update the restaurant', async () => {
    const owner = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const manager = await addMember(owner.restaurant.id, 'RESTAURANT_MANAGER');
    const res = await manager.client.patch('/api/restaurants/current', { phone: '+880 1800-000000' });
    expect(res.status).toBe(200);
  });

  it('role cannot be escalated from the client', async () => {
    const owner = await ownerWithRestaurant(app, 'Alpha Kitchen');
    const kitchen = await addMember(owner.restaurant.id, 'KITCHEN_STAFF');
    const res = await kitchen.client.patch(
      '/api/restaurants/current',
      { name: 'Escalated' },
      { 'x-role': 'RESTAURANT_OWNER' },
    );
    expect(res.status).toBe(403);
  });
});
