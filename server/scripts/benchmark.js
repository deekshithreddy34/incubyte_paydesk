import { performance } from 'node:perf_hooks';
import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculatePercentiles(latencies) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const avg = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;
  return {
    p50: p50.toFixed(2),
    p95: p95.toFixed(2),
    avg: avg.toFixed(2),
    min: sorted[0].toFixed(2),
    max: sorted[sorted.length - 1].toFixed(2),
  };
}

async function benchmarkEndpoint(name, url, iterations = 25) {
  // Cold request
  const t0 = performance.now();
  await request(app).get(url);
  const cold = (performance.now() - t0).toFixed(2);

  // Warm iterations
  const latencies = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await request(app).get(url);
    latencies.push(performance.now() - start);
  }

  const stats = calculatePercentiles(latencies);
  return { name, url, cold, ...stats };
}

async function run() {
  console.log('--- Benchmarking ACME PayDesk Endpoints (10k Seeded Records) ---');

  const benchmarks = [
    { name: 'GET Employees (Default Page 1, 20 items)', url: '/api/employees?page=1&pageSize=20' },
    { name: 'GET Employees with Search (q="seed")', url: '/api/employees?search=seed&page=1&pageSize=20' },
    { name: 'GET Employees with Combined Filters', url: '/api/employees?department=Engineering&country=US&level=L4&page=1&pageSize=20' },
    { name: 'GET Pay Insights (by Department)', url: '/api/pay-insights?groupBy=department' },
    { name: 'GET Pay Insights (by Level)', url: '/api/pay-insights?groupBy=level' },
    { name: 'GET Outliers (by Department)', url: '/api/pay-insights/outliers?groupBy=department' },
    { name: 'GET Outliers (by Level)', url: '/api/pay-insights/outliers?groupBy=level' },
  ];

  const results = [];
  for (const b of benchmarks) {
    const res = await benchmarkEndpoint(b.name, b.url, 25);
    results.push(res);
    console.log(`[DONE] ${b.name}: Cold=${res.cold}ms | p50=${res.p50}ms | p95=${res.p95}ms | Avg=${res.avg}ms`);
  }

  console.log('\n--- EXPLAIN ANALYZE for Pay Insights CTE ---');
  const insightsExplain = await prisma.$queryRawUnsafe(`
    EXPLAIN ANALYZE
    WITH converted AS (
      SELECT
        e."department" AS "groupKey",
        (e."salaryMinorUnits" * c."usdRate" / 1000000.0) AS "usdAmount"
      FROM "Employee" e
      JOIN "Currency" c ON e."currencyCode" = c."code"
    )
    SELECT
      "groupKey",
      COUNT(*)::int AS "employeeCount",
      ROUND(AVG("usdAmount"), 2) AS "meanSalaryUsd",
      ROUND(MIN("usdAmount"), 2) AS "minSalaryUsd",
      ROUND(MAX("usdAmount"), 2) AS "maxSalaryUsd"
    FROM converted
    GROUP BY "groupKey"
  `);
  console.log(insightsExplain.map(r => r['QUERY PLAN']).join('\n'));

  console.log('\n--- EXPLAIN ANALYZE for Search Trigram Query ---');
  const searchExplain = await prisma.$queryRawUnsafe(`
    EXPLAIN ANALYZE
    SELECT id, name, email, department, "countryCode", level, "salaryMinorUnits", "currencyCode"
    FROM "Employee"
    WHERE name ILIKE '%seed%' OR email ILIKE '%seed%'
    ORDER BY "createdAt" DESC
    LIMIT 20 OFFSET 0
  `);
  console.log(searchExplain.map(r => r['QUERY PLAN']).join('\n'));

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
