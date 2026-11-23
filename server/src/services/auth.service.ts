import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError, Errors } from '../utils/errors.js';
import { getDummyHash, hashPassword, verifyPassword } from '../utils/password.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validators.js';

/**
 * Fields that are safe to send to the browser.
 * passwordHash is deliberately NOT in this list — always select with this.
 */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  platformRole: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw Errors.conflict('An account with this email already exists', 'EMAIL_TAKEN');

  const passwordHash = await hashPassword(input.password);
  try {
    return await prisma.user.create({
      // platformRole is NOT set here → always defaults to USER.
      data: { name: input.name, email: input.email, passwordHash },
      select: publicUserSelect,
    });
  } catch (err) {
    // Two simultaneous registrations with the same email
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw Errors.conflict('An account with this email already exists', 'EMAIL_TAKEN');
    }
    throw err;
  }
}

export async function authenticate(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...publicUserSelect, passwordHash: true },
  });
  // Always run a hash comparison so response time doesn't reveal if the email exists.
  const ok = await verifyPassword(input.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !ok) throw Errors.invalidCredentials();

  const { passwordHash: _omit, ...safeUser } = user;
  return safeUser;
}

export async function getUserWithMemberships(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...publicUserSelect,
      memberships: {
        orderBy: { createdAt: 'asc' },
        select: {
          role: true,
          restaurant: { select: { id: true, name: true, slug: true, logo: true, status: true } },
        },
      },
    },
  });
}

export async function updateUserProfile(userId: string, data: { name: string }) {
  return prisma.user.update({ where: { id: userId }, data: { name: data.name }, select: publicUserSelect });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AppError(
      400,
      'INVALID_CURRENT_PASSWORD',
      'Current password is incorrect',
      { fields: { currentPassword: 'Current password is incorrect' } },
    );
  }
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
}
