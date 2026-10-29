import { prisma } from '../../db/prisma.js';

export async function findCurrencies() {
  return prisma.currency.findMany({
    orderBy: { code: 'asc' },
  });
}

