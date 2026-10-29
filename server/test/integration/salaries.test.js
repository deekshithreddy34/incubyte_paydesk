import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { resetTestDatabase } from '../helpers/db.js';

describe('Salary and History API Integration Tests', () => {
  let testEmployee;

  beforeAll(async () => {
    await prisma.$connect();
    await resetTestDatabase(prisma);

    // Create an employee with an initial history
    testEmployee = await prisma.employee.create({
      data: {
        employeeCode: 'ACME-99991',
        name: 'Salary Tester',
        email: 'salary.tester@example.com',
        countryCode: 'US',
        department: 'Engineering',
        level: 'Mid',
        salaryMinorUnits: 8000000n, // $80,000.00
        currencyCode: 'USD',
        salaryHistory: {
          create: {
            salaryMinorUnits: 8000000n,
            currencyCode: 'USD',
          },
        },
      },
    });
  });

  afterAll(async () => {
    await resetTestDatabase(prisma);
    await prisma.$disconnect();
  });

  describe('PATCH /api/employees/:id/salary', () => {
    it('updates current salary and appends a history row on valid change', async () => {
      const res = await request(app)
        .patch(`/api/employees/${testEmployee.id}/salary`)
        .send({
          salaryMinorUnits: 9500000,
          currencyCode: 'USD',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.salaryMinorUnits).toBe(9500000);
      expect(res.body.data.currencyCode).toBe('USD');

      const histories = await prisma.salaryHistory.findMany({
        where: { employeeId: testEmployee.id },
        orderBy: { changedAt: 'asc' },
      });

      expect(histories.length).toBe(2);
      expect(histories[1].salaryMinorUnits).toBe(9500000n);
      expect(histories[1].currencyCode).toBe('USD');
    });

    it('records history when only currency changes', async () => {
      const res = await request(app)
        .patch(`/api/employees/${testEmployee.id}/salary`)
        .send({
          salaryMinorUnits: 9500000,
          currencyCode: 'EUR', // not in lookups
        });

      // Should reject unsupported currency
      expect(res.status).toBe(400);

      // Change to valid currency (GBP)
      const resGbp = await request(app)
        .patch(`/api/employees/${testEmployee.id}/salary`)
        .send({
          salaryMinorUnits: 9500000,
          currencyCode: 'GBP',
        });

      expect(resGbp.status).toBe(200);
      expect(resGbp.body.data.currencyCode).toBe('GBP');

      const count = await prisma.salaryHistory.count({
        where: { employeeId: testEmployee.id },
      });
      expect(count).toBe(3);
    });

    it('idempotency: does not insert history row if amount AND currency are unchanged', async () => {
      const countBefore = await prisma.salaryHistory.count({
        where: { employeeId: testEmployee.id },
      });

      const res = await request(app)
        .patch(`/api/employees/${testEmployee.id}/salary`)
        .send({
          salaryMinorUnits: 9500000,
          currencyCode: 'GBP',
        });

      expect(res.status).toBe(200);

      const countAfter = await prisma.salaryHistory.count({
        where: { employeeId: testEmployee.id },
      });
      expect(countAfter).toBe(countBefore);
    });

    it('returns 404 for unknown employee ID', async () => {
      const res = await request(app)
        .patch('/api/employees/f5c9f732-fbc0-45a0-b899-39dcddb4a015/salary')
        .send({
          salaryMinorUnits: 1000000,
          currencyCode: 'USD',
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for invalid UUID format or malformed body', async () => {
      const resBadId = await request(app)
        .patch('/api/employees/not-a-uuid/salary')
        .send({ salaryMinorUnits: 1000000, currencyCode: 'USD' });
      expect(resBadId.status).toBe(400);

      const resBadSalary = await request(app)
        .patch(`/api/employees/${testEmployee.id}/salary`)
        .send({ salaryMinorUnits: -100, currencyCode: 'USD' });
      expect(resBadSalary.status).toBe(400);
    });

    it('serializes concurrent salary updates atomically without dirty state', async () => {
      // Send 2 concurrent salary update requests with different amounts
      const [res1, res2] = await Promise.all([
        request(app)
          .patch(`/api/employees/${testEmployee.id}/salary`)
          .send({ salaryMinorUnits: 11000000, currencyCode: 'USD' }),
        request(app)
          .patch(`/api/employees/${testEmployee.id}/salary`)
          .send({ salaryMinorUnits: 12000000, currencyCode: 'USD' }),
      ]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const freshEmp = await prisma.employee.findUnique({
        where: { id: testEmployee.id },
      });

      // Employee's salary must equal one of the submitted values
      expect([11000000n, 12000000n]).toContain(freshEmp.salaryMinorUnits);

      // Both intermediate changes must be preserved in history
      const histories = await prisma.salaryHistory.findMany({
        where: { employeeId: testEmployee.id },
        orderBy: { changedAt: 'desc' },
      });

      const amounts = histories.map((h) => h.salaryMinorUnits);
      expect(amounts).toContain(11000000n);
      expect(amounts).toContain(12000000n);
    });
  });

  describe('GET /api/employees/:id/salary-history', () => {
    it('returns paginated salary history newest-first with total count', async () => {
      const res = await request(app)
        .get(`/api/employees/${testEmployee.id}/salary-history?page=1&pageSize=2`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.total).toBeGreaterThanOrEqual(5);

      // Newest first: changedAt of row 0 >= changedAt of row 1
      const t0 = new Date(res.body.data[0].changedAt).getTime();
      const t1 = new Date(res.body.data[1].changedAt).getTime();
      expect(t0).toBeGreaterThanOrEqual(t1);
    });

    it('returns 404 when requesting history of non-existent employee', async () => {
      const res = await request(app)
        .get('/api/employees/f5c9f732-fbc0-45a0-b899-39dcddb4a015/salary-history');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
