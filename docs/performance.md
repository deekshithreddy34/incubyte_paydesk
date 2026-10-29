# ACME PayDesk Performance & Benchmark Report

This document records the database query performance, indexing strategy, and API response latencies benchmarked against the full **10,000 employee seeded dataset**.

---

## 1. Test Environment & Hardware Specification

- **OS**: Windows 11 / Node.js v20.20.2
- **Database**: PostgreSQL 18 (Alpine Container, Docker Engine 28.0)
- **CPU**: AMD / Intel 64-bit Multi-core processor
- **Memory**: 16 GB RAM
- **Dataset Size**: Exactly 10,000 active employees with 10,000 matching salary history audit rows, plus 4 reference currencies (USD, INR, GBP, JPY).

---

## 2. API Latency Benchmarks (25 Iterations per Endpoint)

| Endpoint / Scenario | Cold Latency (ms) | Warm p50 (ms) | Warm p95 (ms) | Average (ms) | Target Latency | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET /api/employees** (Default Page 1, 20 items) | 181.27 ms | **25.00 ms** | **38.47 ms** | 27.08 ms | < 300 ms | ✅ Excellent |
| **GET /api/employees?search=seed** (Trigram Search) | 74.51 ms | **24.08 ms** | **40.59 ms** | 27.44 ms | < 300 ms | ✅ Excellent |
| **GET /api/employees** (Multi-filter: Eng + US + L4) | 12.32 ms | **5.94 ms** | **7.49 ms** | 6.13 ms | < 300 ms | ✅ Excellent |
| **GET /api/pay-insights?groupBy=department** | 44.94 ms | **38.75 ms** | **45.23 ms** | 38.38 ms | < 500 ms | ✅ Excellent |
| **GET /api/pay-insights?groupBy=level** | 37.59 ms | **37.27 ms** | **42.25 ms** | 36.38 ms | < 500 ms | ✅ Excellent |
| **GET /api/pay-insights/outliers?groupBy=department** | 117.78 ms | **132.12 ms** | **237.40 ms** | 146.79 ms | < 500 ms | ✅ Excellent |
| **GET /api/pay-insights/outliers?groupBy=level** | 111.58 ms | **131.99 ms** | **182.55 ms** | 136.11 ms | < 500 ms | ✅ Excellent |

---

## 3. Database Execution Plans (`EXPLAIN ANALYZE`)

### A. Substring & Trigram Search Query Plan
Query:
```sql
EXPLAIN ANALYZE
SELECT id, name, email, department, "countryCode", level, "salaryMinorUnits", "currencyCode"
FROM "Employee"
WHERE name ILIKE '%seed%' OR email ILIKE '%seed%'
ORDER BY "createdAt" DESC
LIMIT 20 OFFSET 0;
```
Execution Output:
```text
Limit  (cost=50.40..50.41 rows=2 width=101) (actual time=0.205..0.206 rows=0.00 loops=1)
  Buffers: shared hit=13
  ->  Sort  (cost=50.40..50.41 rows=2 width=101) (actual time=0.204..0.205 rows=0.00 loops=1)
        Sort Key: "createdAt" DESC
        Sort Method: quicksort  Memory: 25kB
        Buffers: shared hit=13
        ->  Bitmap Heap Scan on "Employee"  (cost=42.97..50.39 rows=2 width=101) (actual time=0.116..0.117 rows=0.00 loops=1)
              Recheck Cond: (((name)::text ~~* '%seed%'::text) OR ((email)::text ~~* '%seed%'::text))
              Buffers: shared hit=10
              ->  BitmapOr  (cost=42.97..42.97 rows=2 width=0) (actual time=0.107..0.108 rows=0.00 loops=1)
                    Buffers: shared hit=10
                    ->  Bitmap Index Scan on "Employee_name_trgm_idx"  (cost=0.00..21.47 rows=1 width=0) (actual time=0.077..0.077 rows=0.00 loops=1)
                          Index Cond: ((name)::text ~~* '%seed%'::text)
                          Index Searches: 1
                          Buffers: shared hit=5
                    ->  Bitmap Index Scan on "Employee_email_trgm_idx"  (cost=0.00..21.49 rows=1 width=0) (actual time=0.030..0.030 rows=0.00 loops=1)
                          Index Cond: ((email)::text ~~* '%seed%'::text)
                          Index Searches: 1
                          Buffers: shared hit=5
Planning:
  Buffers: shared hit=46
Planning Time: 2.042 ms
Execution Time: 0.362 ms
```
**Takeaway**: The `pg_trgm` GIN indexes on `name` and `email` enable a fast Bitmap Index Scan running in **0.36 ms** for substring lookups across 10,000 records.

---

### B. Pay Insights CTE Aggregation Query Plan
Query:
```sql
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
GROUP BY "groupKey";
```
Execution Output:
```text
HashAggregate  (cost=709.34..709.43 rows=4 width=107) (actual time=22.169..22.176 rows=4.00 loops=1)
  Group Key: e.department
  Batches: 1  Memory Usage: 32kB
  Buffers: shared hit=197
  ->  Hash Join  (cost=37.00..359.34 rows=10000 width=35) (actual time=0.082..7.381 rows=10000.00 loops=1)
        Hash Cond: ((e."currencyCode")::text = (c.code)::text)
        Buffers: shared hit=197
        ->  Seq Scan on "Employee" e  (cost=0.00..296.00 rows=10000 width=19) (actual time=0.017..2.315 rows=10000.00 loops=1)
              Buffers: shared hit=196
        ->  Hash  (cost=22.00..22.00 rows=1200 width=36) (actual time=0.028..0.029 rows=4.00 loops=1)
              Buckets: 2048  Batches: 1  Memory Usage: 17kB
              Buffers: shared hit=1
              ->  Seq Scan on "Currency" c  (cost=0.00..22.00 rows=1200 width=36) (actual time=0.015..0.016 rows=4.00 loops=1)
                    Buffers: shared hit=1
Planning:
  Buffers: shared hit=304
Planning Time: 1.513 ms
Execution Time: 22.356 ms
```
**Takeaway**: PostgreSQL hashes the 4-row currency lookup table into memory (17kB) and streams through the 10,000 employees in 2.3ms, yielding an aggregate query execution time of **22.35 ms**.

