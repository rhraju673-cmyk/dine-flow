/**
 * Development seed data — run with:  npm run db:seed
 *
 * Creates the demo restaurant "Zaika Restaurant" and two demo accounts.
 * The script is idempotent (safe to run many times) and REFUSES to run
 * when NODE_ENV=production, so demo credentials never reach production.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ DEVELOPMENT-ONLY DEMO ACCOUNTS                                   │
 * │   Owner : demo@dineflow.local   /  ZaikaDemo2026                 │
 * │   Waiter: waiter@dineflow.local /  ZaikaDemo2026                 │
 * └──────────────────────────────────────────────────────────────────┘
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env'), quiet: true });

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Refusing to seed demo data in production.');
  process.exit(1);
}

export const DEMO_PASSWORD = 'ZaikaDemo2026';
const prisma = new PrismaClient();

const openingHours = {
  mon: { closed: false, open: '11:00', close: '23:00' },
  tue: { closed: false, open: '11:00', close: '23:00' },
  wed: { closed: false, open: '11:00', close: '23:00' },
  thu: { closed: false, open: '11:00', close: '23:00' },
  fri: { closed: false, open: '14:00', close: '23:30' },
  sat: { closed: false, open: '11:00', close: '23:30' },
  sun: { closed: false, open: '11:00', close: '23:00' },
};

async function upsertUser(email: string, name: string, passwordHash: string) {
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, passwordHash },
  });
}

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const trialDays = Number(process.env.TRIAL_DAYS ?? 14);

  const owner = await upsertUser('demo@dineflow.local', 'Arif Rahman', passwordHash);
  const waiter = await upsertUser('waiter@dineflow.local', 'Nusrat Jahan', passwordHash);

  const restaurant = await prisma.$transaction(async (tx) => {
    const r = await tx.restaurant.upsert({
      where: { slug: 'zaika-restaurant' },
      update: {},
      create: {
        name: 'Zaika Restaurant',
        slug: 'zaika-restaurant',
        category: 'CASUAL_DINING',
        description:
          'Family-style Bangladeshi and North Indian kitchen in Gulshan, serving slow-cooked kacchi biryani, charcoal kebabs and seasonal curries since 2016.',
        coverImage: '/images/curry-spread.jpg',
        phone: '+880 1711-000000',
        email: 'hello@zaika.example',
        address: 'House 12, Road 45, Gulshan 2, Dhaka 1212',
        country: 'BD',
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        status: 'ACTIVE',
        settings: { create: { taxRate: 5, serviceCharge: 10, openingHours } },
        subscription: {
          create: {
            plan: 'STARTER',
            status: 'TRIALING',
            trialEndsAt: new Date(Date.now() + trialDays * 86_400_000),
          },
        },
      },
    });

    await tx.restaurantMembership.upsert({
      where: { userId_restaurantId: { userId: owner.id, restaurantId: r.id } },
      update: { role: 'RESTAURANT_OWNER' },
      create: { userId: owner.id, restaurantId: r.id, role: 'RESTAURANT_OWNER' },
    });
    await tx.restaurantMembership.upsert({
      where: { userId_restaurantId: { userId: waiter.id, restaurantId: r.id } },
      update: { role: 'WAITER' },
      create: { userId: waiter.id, restaurantId: r.id, role: 'WAITER' },
    });
    return r;
  });

  console.log('✅ Seeded demo restaurant:', restaurant.name, `(${restaurant.slug})`);
  console.log('   Owner : demo@dineflow.local   /', DEMO_PASSWORD);
  console.log('   Waiter: waiter@dineflow.local /', DEMO_PASSWORD);
  console.log('   ⚠️  Development only — never use these accounts in production.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
