import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { resetTestDatabase } from '../helpers/db.js';

describe('Employee API Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await resetTestDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/employees', () => {
    it('creates employee and initial salary history in one transaction', async () => {
      const payload = {
        employeeCode: 'ACME-10001',
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        countryCode: 'US',
        department: 'Engineering',
        level: 'Senior',
        salaryMinorUnits: 14500000,
        currencyCode: 'USD',
      };

      const res = await request(app).post('/api/employees').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.employeeCode).toBe('ACME-10001');
      expect(res.body.data.salaryMinorUnits).toBe(14500000);
      expect(typeof res.body.data.salaryMinorUnits).toBe('number');

      // Check DB records
      const histories = await prisma.salaryHistory.findMany({
        where: { employeeId: res.body.data.id },
      });
      expect(histories.length).toBe(1);
      expect(histories[0].salaryMinorUnits).toBe(14500000n);
      expect(histories[0].currencyCode).toBe('USD');
    });

    it('rejects duplicate employeeCode or email with 409 Conflict', async () => {
      const dupCode = {
        employeeCode: 'acme-10001', // should be normalized and clash
        name: 'Another Maria',
        email: 'another.maria@example.com',
        countryCode: 'US',
        department: 'Finance',
        level: 'Mid',
        salaryMinorUnits: 9000000,
        currencyCode: 'USD',
      };

      const resCode = await request(app).post('/api/employees').send(dupCode);
      expect(resCode.status).toBe(409);
      expect(resCode.body.error.code).toBe('CONFLICT');

      const dupEmail = {
        employeeCode: 'ACME-10002',
        name: 'Different Name',
        email: 'MARIA.GARCIA@example.com', // normalized to lowercase
        countryCode: 'US',
        department: 'Finance',
        level: 'Mid',
        salaryMinorUnits: 9000000,
        currencyCode: 'USD',
      };

      const resEmail = await request(app).post('/api/employees').send(dupEmail);
      expect(resEmail.status).toBe(409);
      expect(resEmail.body.error.code).toBe('CONFLICT');
    });

    it('rejects invalid lookups or malformed money amounts with 400 Bad Request', async () => {
      const invalidCountry = {
        employeeCode: 'ACME-10003',
        name: 'John Doe',
        email: 'john@example.com',
        countryCode: 'XX',
        department: 'Engineering',
        level: 'Mid',
        salaryMinorUnits: 100000,
        currencyCode: 'USD',
      };
      const res1 = await request(app).post('/api/employees').send(invalidCountry);
      expect(res1.status).toBe(400);

      const invalidSalary = {
        employeeCode: 'ACME-10004',
        name: 'John Doe',
        email: 'john4@example.com',
        countryCode: 'US',
        department: 'Engineering',
        level: 'Mid',
        salaryMinorUnits: -500,
        currencyCode: 'USD',
      };
      const res2 = await request(app).post('/api/employees').send(invalidSalary);
      expect(res2.status).toBe(400);
    });

    it('rejects extra unknown fields in payload strictly with 400', async () => {
      const payload = {
        employeeCode: 'ACME-10005',
        name: 'John Doe',
        email: 'john5@example.com',
        countryCode: 'US',
        department: 'Engineering',
        level: 'Mid',
        salaryMinorUnits: 100000,
        currencyCode: 'USD',
        unknownField: 'malicious',
      };
      const res = await request(app).post('/api/employees').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.error.fields.unknownField).toBeDefined();
    });
  });

  describe('GET /api/employees', () => {
    beforeAll(async () => {
      // Seed a small set of employees for search and filter testing
      const sample = [
        { code: 'ACME-00010', name: 'Special User %_Test', email: 'special@example.com', country: 'IN', dept: 'Finance', lvl: 'Junior', salary: 50000000n, curr: 'INR' },
        { code: 'ACME-00020', name: 'Bob Engineer', email: 'bob.eng@example.com', country: 'US', dept: 'Engineering', lvl: 'Mid', salary: 8500000n, curr: 'USD' },
        { code: 'ACME-00030', name: 'Charlie Lead', email: 'charlie@example.com', country: 'GB', dept: 'Engineering', lvl: 'Lead', salary: 13000000n, curr: 'GBP' },
        { code: 'ACME-00040', name: 'Daisy HR', email: 'daisy.hr@example.com', country: 'JP', dept: 'HR', lvl: 'Junior', salary: 4500000n, curr: 'JPY' },
      ];

      for (const s of sample) {
        await prisma.employee.create({
          data: {
            employeeCode: s.code,
            name: s.name,
            email: s.email,
            countryCode: s.country,
            department: s.dept,
            level: s.lvl,
            salaryMinorUnits: s.salary,
            currencyCode: s.curr,
            salaryHistory: {
              create: {
                salaryMinorUnits: s.salary,
                currencyCode: s.curr,
              },
            },
          },
        });
      }
    });

    it('filters employees by country, department, and level', async () => {
      const res = await request(app).get('/api/employees?country=US&department=Engineering');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2); // Maria Garcia + Bob Engineer
      expect(res.body.total).toBe(2);
      expect(res.body.data.every((e) => e.countryCode === 'US' && e.department === 'Engineering')).toBe(true);
    });

    it('supports literal search without interpreting % or _ as wildcards', async () => {
      const resExact = await request(app).get('/api/employees?search=%_Test');
      expect(resExact.status).toBe(200);
      expect(resExact.body.data.length).toBe(1);
      expect(resExact.body.data[0].employeeCode).toBe('ACME-00010');

      // Search with SQL injection attempt is treated as plain literal search
      const resSql = await request(app).get("/api/employees?search=' OR '1'='1");
      expect(resSql.status).toBe(200);
      expect(resSql.body.data.length).toBe(0);
    });

    it('returns paginated results with stable ordering and correct metadata', async () => {
      const page1 = await request(app).get('/api/employees?page=1&pageSize=2');
      expect(page1.status).toBe(200);
      expect(page1.body.data.length).toBe(2);
      expect(page1.body.page).toBe(1);
      expect(page1.body.pageSize).toBe(2);
      expect(page1.body.total).toBeGreaterThanOrEqual(5);

      const page2 = await request(app).get('/api/employees?page=2&pageSize=2');
      expect(page2.status).toBe(200);
      expect(page2.body.data.length).toBe(2);
      expect(page2.body.page).toBe(2);

      // Verify no overlap between page 1 and page 2
      const idsPage1 = page1.body.data.map((e) => e.id);
      const idsPage2 = page2.body.data.map((e) => e.id);
      expect(idsPage1.some((id) => idsPage2.includes(id))).toBe(false);
    });

    it('out of range page returns empty data array with correct total', async () => {
      const res = await request(app).get('/api/employees?page=999&pageSize=25');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBeGreaterThanOrEqual(5);
    });
  });
});
