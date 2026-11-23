import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const testDbUrl = process.env.TEST_DATABASE_URL;
if (!testDbUrl) throw new Error('TEST_DATABASE_URL is missing in .env — tests need their own database.');
if (testDbUrl === process.env.DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL must be different from DATABASE_URL (tests erase all data).');
}

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
    setupFiles: ['tests/setup.ts'],
    // All test files share one database → run them one after another.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 120_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: testDbUrl,
    },
  },
});
