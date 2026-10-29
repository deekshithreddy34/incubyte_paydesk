import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { CURRENCIES } from '../../src/config/lookups.js';

export async function resetTestDatabase(prismaClient) {
  await prismaClient.salaryHistory.deleteMany();
  await prismaClient.employee.deleteMany();
  await prismaClient.currency.deleteMany();

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

