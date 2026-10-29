import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { generateSeedData } from '../../prisma/seed-data.js';

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/acme_salary_test?schema=public',
    },
  },
});

describe('Database Seed Integration Tests', () => {
  beforeAll(async () => {
    await testPrisma.$connect();
    await testPrisma.salaryHistory.deleteMany();
    await testPrisma.employee.deleteMany();
    await testPrisma.currency.deleteMany();
  });

  afterAll(async () => {
    await testPrisma.salaryHistory.deleteMany();
    await testPrisma.employee.deleteMany();
    await testPrisma.currency.deleteMany();
    await testPrisma.$disconnect();
  });

  it('populates and verifies bounded deterministic seed data in test database', async () => {
    const SAMPLE_COUNT = 100;
    const { currencies, employees, salaryHistories } = generateSeedData({ count: SAMPLE_COUNT, seed: 42 });

    // Seed currencies
    for (const c of currencies) {
      await testPrisma.currency.upsert({
        where: { code: c.code },
        update: { decimalPlaces: c.decimalPlaces, usdRate: c.usdRate },
        create: { code: c.code, decimalPlaces: c.decimalPlaces, usdRate: c.usdRate },
      });
    }

    // Insert employees and histories
    await testPrisma.employee.createMany({ data: employees });
    await testPrisma.salaryHistory.createMany({ data: salaryHistories });

    const totalEmployees = await testPrisma.employee.count();
    const totalHistories = await testPrisma.salaryHistory.count();

    expect(totalEmployees).toBe(SAMPLE_COUNT);
    expect(totalHistories).toBe(SAMPLE_COUNT);

    // Verify first and last records match generator
    const firstEmp = await testPrisma.employee.findUnique({
      where: { employeeCode: 'ACME-00001' },
      include: { salaryHistory: true },
    });

    expect(firstEmp).not.toBeNull();
    expect(firstEmp.salaryMinorUnits).toBe(employees[0].salaryMinorUnits);
    expect(firstEmp.salaryHistory.length).toBe(1);
    expect(firstEmp.salaryHistory[0].salaryMinorUnits).toBe(firstEmp.salaryMinorUnits);
  });
});

