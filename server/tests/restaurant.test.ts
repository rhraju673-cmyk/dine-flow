import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { makeApp, ownerWithRestaurant, registeredClient, validRestaurant } from './helpers.js';

const app = makeApp();

describe('Restaurant creation (onboarding)', () => {
  it('creates restaurant, owner membership, settings and trial in one go', async () => {
    const { client, user } = await registeredClient(app);
    const res = await client.post('/api/restaurants', validRestaurant);

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('RESTAURANT_OWNER');
    const r = res.body.restaurant;
    expect(r).toMatchObject({
      name: 'Spice Garden',
      slug: 'spice-garden',
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      country: 'BD',
      status: 'ACTIVE',
    });
    expect(r.settings).toMatchObject({ taxRate: 0, serviceCharge: 0 });
    expect(r.subscription.status).toBe('TRIALING');

    const trialEnds = new Date(r.subscription.trialEndsAt).getTime();
    const days = (trialEnds - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(13.9);
    expect(days).toBeLessThanOrEqual(14);

    const membership = await prisma.restaurantMembership.findUniqueOrThrow({
      where: { userId_restaurantId: { userId: user.id, restaurantId: r.id } },
    });
    expect(membership.role).toBe('RESTAURANT_OWNER');
    expect(await prisma.restaurantSettings.count({ where: { restaurantId: r.id } })).toBe(1);
    expect(await prisma.subscription.count({ where: { restaurantId: r.id } })).toBe(1);

    // The new restaurant becomes the active one for this session.
    const session = await prisma.session.findFirstOrThrow({ where: { userId: user.id } });
    expect(session.activeRestaurantId).toBe(r.id);
  });

  it('generates unique slugs for restaurants with the same name', async () => {
    const a = await ownerWithRestaurant(app, 'Zaika Restaurant');
    const b = await ownerWithRestaurant(app, 'Zaika Restaurant');
    expect(a.restaurant.slug).toBe('zaika-restaurant');
    expect(b.restaurant.slug).toMatch(/^zaika-restaurant-[a-f0-9]{6}$/);
  });

  it('handles Unicode restaurant names', async () => {
    const { client } = await registeredClient(app);
    const res = await client.post('/api/restaurants', { ...validRestaurant, name: 'জাইকা রেস্তোরাঁ' });
    expect(res.status).toBe(201);
    expect(res.body.restaurant.name).toBe('জাইকা রেস্তোরাঁ');
    expect(res.body.restaurant.slug).toBe('restaurant');
  });

  it('ignores role / status / slug fields sent by the client', async () => {
    const { client, user } = await registeredClient(app);
    const res = await client.post('/api/restaurants', {
      ...validRestaurant,
      role: 'SUPER_ADMIN',
      status: 'SUSPENDED',
      slug: 'hijacked',
    });
    expect(res.status).toBe(201);
    expect(res.body.restaurant.status).toBe('ACTIVE');
    expect(res.body.restaurant.slug).toBe('spice-garden');
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(dbUser.platformRole).toBe('USER');
  });

  it('validates onboarding input', async () => {
    const { client } = await registeredClient(app);
    const res = await client.post('/api/restaurants', {
      ...validRestaurant,
      name: '',
      currency: 'XYZ',
      timezone: 'Mars/Olympus',
      country: 'ZZ',
      category: 'SPACESHIP',
    });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details.fields)).toEqual(
      expect.arrayContaining(['name', 'currency', 'timezone', 'country', 'category']),
    );
    expect(await prisma.restaurant.count()).toBe(0);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/restaurants').send(validRestaurant);
    // CSRF check runs first for anonymous POSTs without a token → still rejected.
    expect([401, 403]).toContain(res.status);
    expect(await prisma.restaurant.count()).toBe(0);
  });
});

describe('Current restaurant', () => {
  it('returns 404 NO_RESTAURANT before onboarding', async () => {
    const { client } = await registeredClient(app);
    const res = await client.get('/api/restaurants/current');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NO_RESTAURANT');
  });

  it('returns the owner’s restaurant', async () => {
    const { client, restaurant } = await ownerWithRestaurant(app);
    const res = await client.get('/api/restaurants/current');
    expect(res.status).toBe(200);
    expect(res.body.restaurant.id).toBe(restaurant.id);
    expect(res.body.role).toBe('RESTAURANT_OWNER');
  });
});

describe('Restaurant profile updates', () => {
  it('updates profile fields and settings', async () => {
    const { client } = await ownerWithRestaurant(app);
    const hours = { closed: false, open: '10:00', close: '22:00' };
    const res = await client.patch('/api/restaurants/current', {
      name: 'Spice Garden Dhanmondi',
      description: 'Modern Bengali kitchen.',
      logo: '/images/biryani.jpg',
      coverImage: 'https://images.example.com/cover.jpg',
      currency: 'USD',
      settings: {
        taxRate: 7.5,
        serviceCharge: 10,
        openingHours: { mon: hours, tue: hours, wed: hours, thu: hours, fri: hours, sat: hours, sun: { ...hours, closed: true } },
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.restaurant).toMatchObject({
      name: 'Spice Garden Dhanmondi',
      description: 'Modern Bengali kitchen.',
      logo: '/images/biryani.jpg',
      currency: 'USD',
      slug: 'spice-garden', // slug does not change on rename
    });
    expect(res.body.restaurant.settings).toMatchObject({ taxRate: 7.5, serviceCharge: 10 });
    expect(res.body.restaurant.settings.openingHours.sun.closed).toBe(true);
  });

  it('clears optional fields when sent empty', async () => {
    const { client } = await ownerWithRestaurant(app);
    await client.patch('/api/restaurants/current', { description: 'Temp' }).expect(200);
    const res = await client.patch('/api/restaurants/current', { description: '' });
    expect(res.status).toBe(200);
    expect(res.body.restaurant.description).toBeNull();
  });

  it('rejects unsafe image URLs and invalid values', async () => {
    const { client } = await ownerWithRestaurant(app);
    const res = await client.patch('/api/restaurants/current', {
      logo: 'javascript:alert(1)',
      settings: { taxRate: 150 },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.details.fields).toHaveProperty('logo');
    expect(res.body.error.details.fields).toHaveProperty('settings.taxRate');
  });

  it('does not allow changing status or slug', async () => {
    const { client, restaurant } = await ownerWithRestaurant(app);
    await client.patch('/api/restaurants/current', { name: 'Still Mine', status: 'SUSPENDED', slug: 'x' }).expect(200);
    const db = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurant.id } });
    expect(db.status).toBe('ACTIVE');
    expect(db.slug).toBe('spice-garden');
  });

  it('rejects an empty update', async () => {
    const { client } = await ownerWithRestaurant(app);
    expect((await client.patch('/api/restaurants/current', {})).status).toBe(400);
  });
});

describe('Dashboard overview', () => {
  it('returns real setup data without fabricated revenue', async () => {
    const { client, restaurant } = await ownerWithRestaurant(app);
    const res = await client.get('/api/dashboard/overview');
    expect(res.status).toBe(200);
    expect(res.body.restaurant.id).toBe(restaurant.id);
    expect(res.body.subscription.status).toBe('TRIALING');
    expect(res.body.subscription.trialDaysRemaining).toBe(14);
    expect(res.body.profileCompletion.percent).toBeGreaterThan(0);
    expect(res.body.profileCompletion.percent).toBeLessThan(100);
    expect(res.body.setup.checklist.find((c: { key: string }) => c.key === 'addMenu').available).toBe(false);
    expect(JSON.stringify(res.body)).not.toMatch(/revenue|sales/i);
  });

  it('requires a session', async () => {
    expect((await request(app).get('/api/dashboard/overview')).status).toBe(401);
  });
});
