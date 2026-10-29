import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { resetTestDatabase } from '../helpers/db.js';

describe('SQL Pay Insights & Outliers Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await resetTestDatabase(prisma);

    // Seed test employees across currencies and levels:
    // USD: 10000000 minor units ($100,000.00)
    // INR: 80000000 paise (800,000 INR @ 0.012 = $9,600.00 -> 960000 cents)
    // GBP: 8000000 pence (80,000 GBP @ 1.25 = $100,000.00 -> 10000000 cents)
    // JPY: 10000000 yen (10,000,000 JPY (0 dec) @ 0.0067 = $67,000.00 -> 6700000 cents)

    // Group 1: Engineering (5 employees, contains intentional high outlier)
    // Values: 100, 100, 100, 100, 1000 (in $1000 units -> $100k, $100k, $100k, $100k, $1M)
    // Outlier math: Q1 = 100, Q3 = 100, IQR = 0. Upper bound = 100 + 1.5 * 0 = 100.
    // 1000 > 100 => HIGH outlier. 100 is on boundary, NOT outlier.
    const engineering = [
      { code: 'ENG-01', name: 'Eng 1', email: 'eng1@example.com', country: 'US', dept: 'Engineering', lvl: 'Mid', salary: 10000000n, curr: 'USD' }, // $100k
      { code: 'ENG-02', name: 'Eng 2', email: 'eng2@example.com', country: 'GB', dept: 'Engineering', lvl: 'Mid', salary: 8000000n, curr: 'GBP' },  // $100k
      { code: 'ENG-03', name: 'Eng 3', email: 'eng3@example.com', country: 'US', dept: 'Engineering', lvl: 'Mid', salary: 10000000n, curr: 'USD' }, // $100k
      { code: 'ENG-04', name: 'Eng 4', email: 'eng4@example.com', country: 'US', dept: 'Engineering', lvl: 'Mid', salary: 10000000n, curr: 'USD' }, // $100k
      { code: 'ENG-05', name: 'Eng 5 (Outlier)', email: 'eng5@example.com', country: 'US', dept: 'Engineering', lvl: 'Lead', salary: 100000000n, curr: 'USD' }, // $1,000,000
    ];

    // Group 2: HR (3 employees -> < 4 employees, should yield NO outliers)
    const hr = [
      { code: 'HR-01', name: 'HR 1', email: 'hr1@example.com', country: 'JP', dept: 'HR', lvl: 'Junior', salary: 10000000n, curr: 'JPY' }, // $67k
      { code: 'HR-02', name: 'HR 2', email: 'hr2@example.com', country: 'JP', dept: 'HR', lvl: 'Mid', salary: 10000000n, curr: 'JPY' },    // $67k
      { code: 'HR-03', name: 'HR 3', email: 'hr3@example.com', country: 'JP', dept: 'HR', lvl: 'Senior', salary: 100000000n, curr: 'JPY' }, // $670k (extreme, but group < 4!)
    ];

    for (const e of [...engineering, ...hr]) {
      await prisma.employee.create({
        data: {
          employeeCode: e.code,
          name: e.name,
          email: e.email,
          countryCode: e.country,
          department: e.dept,
          level: e.lvl,
          salaryMinorUnits: e.salary,
          currencyCode: e.curr,
          salaryHistory: {
            create: {
              salaryMinorUnits: e.salary,
              currencyCode: e.curr,
            },
          },
        },
      });
    }
  });

  afterAll(async () => {
    await resetTestDatabase(prisma);
    await prisma.$disconnect();
  });

  describe('GET /api/pay-insights', () => {
    it('computes correct count, min, max, and avg in USD cents by department', async () => {
      const res = await request(app).get('/api/pay-insights?groupBy=department');

      expect(res.status).toBe(200);
      expect(res.body.currencyCode).toBe('USD');
      expect(res.body.groupBy).toBe('department');

      const engSummary = res.body.data.find((d) => d.group === 'Engineering');
      expect(engSummary).toBeDefined();
      expect(engSummary.employeeCount).toBe(5);
      expect(engSummary.minSalaryUsdMinorUnits).toBe(10000000); // $100,000.00
      expect(engSummary.maxSalaryUsdMinorUnits).toBe(100000000); // $1,000,000.00
      // Avg: (100k * 4 + 1000k) / 5 = 1400k / 5 = 280,000.00 = 28000000 cents
      expect(engSummary.averageSalaryUsdMinorUnits).toBe(28000000);

      const hrSummary = res.body.data.find((d) => d.group === 'HR');
      expect(hrSummary).toBeDefined();
      expect(hrSummary.employeeCount).toBe(3);
    });

    it('filters pay-insights when optional filters are provided', async () => {
      const res = await request(app).get('/api/pay-insights?groupBy=department&country=GB');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].group).toBe('Engineering');
      expect(res.body.data[0].employeeCount).toBe(1);
      expect(res.body.data[0].minSalaryUsdMinorUnits).toBe(10000000);
    });

    it('returns empty data array when filter matches no employees', async () => {
      const res = await request(app).get('/api/pay-insights?groupBy=department&department=Finance');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/pay-insights/outliers', () => {
    it('identifies exact high outlier in Engineering and produces no outliers for HR (< 4 employees)', async () => {
      const res = await request(app).get('/api/pay-insights/outliers?groupBy=department');

      expect(res.status).toBe(200);
      expect(res.body.method).toBe('IQR_1_5');
      expect(res.body.currencyCode).toBe('USD');
      expect(res.body.total).toBe(1);
      expect(res.body.data.length).toBe(1);

      const outlier = res.body.data[0];
      expect(outlier.group).toBe('Engineering');
      expect(outlier.direction).toBe('HIGH');
      expect(outlier.salaryUsdMinorUnits).toBe(100000000); // $1,000,000.00
      expect(outlier.employee.employeeCode).toBe('ENG-05');
    });

    it('supports pagination on outlier results', async () => {
      const res = await request(app).get('/api/pay-insights/outliers?groupBy=department&page=1&pageSize=10');
      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(10);
      expect(res.body.total).toBe(1);
    });
  });
});

