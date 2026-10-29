# 11 — Full verification and CI
Prerequisite: 03–10. Tests should already exist; this step joins and checks coverage.

## Steps
1. Separate fast unit/component tests from PostgreSQL integration and browser E2E tests. Default unit command never requires a database or external network.
2. Use a dedicated TEST_DATABASE_URL; refuse destructive test setup when it matches DATABASE_URL or lacks the explicit test designation. Apply real migrations.
3. Give integration tests isolated schemas/databases or run them serially with deterministic cleanup. Never let parallel tests share mutable fixtures.
4. Add Playwright happy-path tests: browse/filter/page; create unique employee; change salary and view history; view grouped insights/outliers. Use fixed small fixtures for correctness, seeded 10k data for a separate smoke/performance check.
5. Exercise real atomic rollback and concurrency tests from 07; do not mark mocked transaction tests as substitutes.
6. Run reproducibility check from 04 twice in the disposable database.
7. Add CI: npm ci → Prisma generate → lint → unit/component tests → provision PostgreSQL → migrate → integration tests → production build → start app → Playwright.
8. Collect coverage, inspect missing business branches and add useful tests. Target strong coverage of money, validation, salary rules and analytics without writing tests only to inflate a percentage.
9. Benchmark seeded GET employees, combined filters/search, summary and outliers. Capture database query plans, hardware, warm/cold conditions and p50/p95 over repeated runs.
10. Use proposed local goals, not guarantees: warm employee browsing p95 <300ms and insights/outliers p95 <500ms on documented local environment. Investigate failures; report measured results honestly. Exclude latency thresholds from ordinary unit CI.
11. Inspect UI at desktop and mobile width, keyboard navigation, failed requests and repeated submissions.

## Test principles
Fixed timestamps, independent expected values, no arbitrary sleeps, no live exchange-rate services. Mock HTTP in component tests, use real PostgreSQL for SQL/constraints/transactions. Avoid snapshot-only assertions and mocking every internal call.

## Files
playwright.config.js; tests/e2e/*.spec.js; server/test/helpers/database.js; client/src/test/setup.js; .github/workflows/ci.yml; docs/testing.md; docs/performance.md.

## Acceptance
All required commands pass from clean checkout. No skipped core tests. Report actual coverage and benchmark numbers with environment. Test data cannot overwrite development or deployed data.
Commit: test: verify end-to-end workflows and database guarantees.

