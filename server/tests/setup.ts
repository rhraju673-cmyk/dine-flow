import { afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/lib/prisma.js';

// Safety net: never wipe a database that isn't the test database.
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error(`Refusing to run tests against a non-test database: ${process.env.DATABASE_URL}`);
}

/** Every test starts with an empty database. */
beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE sessions, restaurant_memberships, restaurant_settings, subscriptions, restaurants, users RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
