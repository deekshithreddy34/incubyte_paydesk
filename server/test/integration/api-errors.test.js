import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';

describe('API Foundation & Error Handling Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
    // Ensure test currencies exist
    await prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: { code: 'USD', decimalPlaces: 2, usdRate: '1.00000000' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health returns 200 with status ok and ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it('GET /api/filter-options returns structured lookup lists and currency metadata', async () => {
    const res = await request(app).get('/api/filter-options');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();

    const { countries, departments, levels, currencies } = res.body.data;
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.some((c) => c.code === 'US')).toBe(true);

    expect(departments).toEqual(expect.arrayContaining(['Engineering', 'Finance', 'HR', 'Sales']));
    expect(levels).toEqual(expect.arrayContaining(['Junior', 'Mid', 'Senior', 'Lead']));

    expect(Array.isArray(currencies)).toBe(true);
    const usd = currencies.find((c) => c.code === 'USD');
    expect(usd).toBeDefined();
    expect(usd.decimalPlaces).toBe(2);
    expect(typeof usd.usdRate).toBe('string');
  });

  it('GET /api/nonexistent returns standard 404 error envelope', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'API endpoint not found',
      },
    });
  });

  it('POST with malformed JSON body returns 400 MALFORMED_JSON envelope', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{ "brokenJson: ');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('MALFORMED_JSON');
  });
});

