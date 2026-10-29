import { describe, it, expect } from 'vitest';
import { generateSeedData, createRng, generateDeterministicUuid } from '../../prisma/seed-data.js';
import { ALLOWED_COUNTRIES, ALLOWED_DEPARTMENTS, ALLOWED_LEVELS, ALLOWED_CURRENCY_CODES } from '../../src/config/lookups.js';

describe('Seed Data Generator Unit Tests', () => {
  it('same seed produces byte-equivalent sorted objects', () => {
    const run1 = generateSeedData({ count: 100, seed: 42 });
    const run2 = generateSeedData({ count: 100, seed: 42 });

    expect(JSON.stringify(run1, (k, v) => typeof v === 'bigint' ? v.toString() : v))
      .toBe(JSON.stringify(run2, (k, v) => typeof v === 'bigint' ? v.toString() : v));
  });

  it('different seeds change the generated salary distribution', () => {
    const run1 = generateSeedData({ count: 10, seed: 42 });
    const run2 = generateSeedData({ count: 10, seed: 99 });

    expect(run1.employees[0].salaryMinorUnits).not.toBe(run2.employees[0].salaryMinorUnits);
  });

  it('generates exactly the requested count with unique IDs, employeeCodes, and emails', () => {
    const count = 500;
    const { employees, salaryHistories } = generateSeedData({ count, seed: 42 });

    expect(employees.length).toBe(count);
    expect(salaryHistories.length).toBe(count);

    const idSet = new Set(employees.map((e) => e.id));
    const codeSet = new Set(employees.map((e) => e.employeeCode));
    const emailSet = new Set(employees.map((e) => e.email));

    expect(idSet.size).toBe(count);
    expect(codeSet.size).toBe(count);
    expect(emailSet.size).toBe(count);
  });

  it('each current salary matches its initial history record exactly', () => {
    const { employees, salaryHistories } = generateSeedData({ count: 50, seed: 42 });

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const hist = salaryHistories[i];

      expect(hist.employeeId).toBe(emp.id);
      expect(hist.salaryMinorUnits).toBe(emp.salaryMinorUnits);
      expect(hist.currencyCode).toBe(emp.currencyCode);
      expect(hist.changedAt).toBe(emp.createdAt);
    }
  });

  it('all generated fields respect lookup constraints and safe bounds', () => {
    const { employees } = generateSeedData({ count: 200, seed: 42 });

    for (const emp of employees) {
      expect(ALLOWED_COUNTRIES).toContain(emp.countryCode);
      expect(ALLOWED_DEPARTMENTS).toContain(emp.department);
      expect(ALLOWED_LEVELS).toContain(emp.level);
      expect(ALLOWED_CURRENCY_CODES).toContain(emp.currencyCode);
      expect(emp.salaryMinorUnits >= 1n).toBe(true);
      expect(emp.salaryMinorUnits <= BigInt(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(emp.employeeCode).toMatch(/^ACME-\d{5}$/);
    }
  });
});

