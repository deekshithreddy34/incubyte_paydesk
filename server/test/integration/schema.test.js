import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { bigIntToNumber, serializeRecord } from '../../src/lib/serialize.js';
import { resetTestDatabase } from '../helpers/db.js';

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/acme_salary_test?schema=public',
    },
  },
});

describe('Database Schema & Constraints Integration Tests', () => {
  beforeAll(async () => {
    await testPrisma.$connect();
    await resetTestDatabase(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it('rejects currency with decimalPlaces out of bounds (< 0 or > 3)', async () => {
    await expect(
      testPrisma.currency.create({
        data: {
          code: 'ERR',
          decimalPlaces: 4,
          usdRate: 1.0,
        },
      })
    ).rejects.toThrow();
  });

  it('rejects currency with usdRate <= 0', async () => {
    await expect(
      testPrisma.currency.create({
        data: {
          code: 'NEG',
          decimalPlaces: 2,
          usdRate: 0,
        },
      })
    ).rejects.toThrow();
  });

  it('creates employee and round-trips BigInt salaryMinorUnits accurately', async () => {
    const emp = await testPrisma.employee.create({
      data: {
        employeeCode: 'EMP001',
        name: 'Alice Smith',
        email: 'alice@acme.com',
        countryCode: 'US',
        department: 'Engineering',
        level: 'Mid',
        salaryMinorUnits: 8500000n, // $85,000.00
        currencyCode: 'USD',
      },
    });

    expect(emp.salaryMinorUnits).toBe(8500000n);
    expect(bigIntToNumber(emp.salaryMinorUnits)).toBe(8500000);
    
    const serialized = serializeRecord(emp);
    expect(serialized.salaryMinorUnits).toBe(8500000);
    expect(typeof serialized.salaryMinorUnits).toBe('number');
  });

  it('enforces unique constraints on email and employeeCode', async () => {
    await expect(
      testPrisma.employee.create({
        data: {
          employeeCode: 'EMP001',
          name: 'Bob Duplicate Code',
          email: 'bob@acme.com',
          countryCode: 'US',
          department: 'Sales',
          level: 'Junior',
          salaryMinorUnits: 5000000n,
          currencyCode: 'USD',
        },
      })
    ).rejects.toThrow();

    await expect(
      testPrisma.employee.create({
        data: {
          employeeCode: 'EMP002',
          name: 'Alice Duplicate Email',
          email: 'alice@acme.com',
          countryCode: 'US',
          department: 'Sales',
          level: 'Junior',
          salaryMinorUnits: 5000000n,
          currencyCode: 'USD',
        },
      })
    ).rejects.toThrow();
  });

  it('rejects employee with missing or invalid foreign key currency', async () => {
    await expect(
      testPrisma.employee.create({
        data: {
          employeeCode: 'EMP003',
          name: 'Charlie Ghost Currency',
          email: 'charlie@acme.com',
          countryCode: 'US',
          department: 'HR',
          level: 'Lead',
          salaryMinorUnits: 12000000n,
          currencyCode: 'XYZ',
        },
      })
    ).rejects.toThrow();
  });

  it('rejects employee salaryMinorUnits <= 0 (check constraint)', async () => {
    await expect(
      testPrisma.employee.create({
        data: {
          employeeCode: 'EMP004',
          name: 'Zero Salary',
          email: 'zerosalary@acme.com',
          countryCode: 'US',
          department: 'Finance',
          level: 'Junior',
          salaryMinorUnits: 0n,
          currencyCode: 'USD',
        },
      })
    ).rejects.toThrow();
  });

  it('rejects employee salaryMinorUnits exceeding MAX_SAFE_INTEGER', async () => {
    const exceedsMax = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
    await expect(
      testPrisma.employee.create({
        data: {
          employeeCode: 'EMP005',
          name: 'Excessive Salary',
          email: 'excessive@acme.com',
          countryCode: 'US',
          department: 'Finance',
          level: 'Senior',
          salaryMinorUnits: exceedsMax,
          currencyCode: 'USD',
        },
      })
    ).rejects.toThrow();
  });

  it('rejects employee deletion when salary history exists (Restrict)', async () => {
    const emp = await testPrisma.employee.findUnique({
      where: { employeeCode: 'EMP001' },
    });

    await testPrisma.salaryHistory.create({
      data: {
        employeeId: emp.id,
        salaryMinorUnits: emp.salaryMinorUnits,
        currencyCode: emp.currencyCode,
      },
    });

    await expect(
      testPrisma.employee.delete({
        where: { id: emp.id },
      })
    ).rejects.toThrow();
  });
});

