import { PrismaClient } from '@prisma/client';
import { CURRENCIES } from '../../src/config/lookups.js';

// If TEST_DATABASE_URL is provided, override DATABASE_URL for the test process
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

/**
 * Validate that the database connection string is explicitly for testing.
 * Refuses destructive operations on non-test databases.
 */
export function assertTestDatabase(url = process.env.DATABASE_URL || '') {
  const isTest = url.toLowerCase().includes('test');
  if (!isTest) {
    throw new Error(
      `Safety guard violation: Refusing destructive test setup on non-test database (${url}). ` +
      `Ensure DATABASE_URL or TEST_DATABASE_URL explicitly points to a test database containing 'test'.`
    );
  }
}

let prisma;

export function getTestPrisma() {
  if (!prisma) {
    assertTestDatabase(process.env.DATABASE_URL);
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

export async function resetTestDatabase(prismaClient = getTestPrisma()) {
  assertTestDatabase(process.env.DATABASE_URL);

  // Clean in FK order
  await prismaClient.salaryHistory.deleteMany();
  await prismaClient.employee.deleteMany();
  await prismaClient.currency.deleteMany();

  // Seed reference currencies
  for (const c of CURRENCIES) {
    await prismaClient.currency.create({
      data: {
        code: c.code,
        decimalPlaces: c.decimalPlaces,
        usdRate: c.usdRate,
      },
    });
  }
}
