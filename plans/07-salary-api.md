# 07 — Atomic salary updates and history
Prerequisite: 06.

## Steps
1. Write tests for changed amount, changed currency, unchanged values and missing employee.
2. Implement PATCH /api/employees/:id/salary; strict body contains salaryMinorUnits and currencyCode only.
3. Start an interactive database transaction. Select the employee row FOR UPDATE using parameterized SQL on the transaction client. Missing row → 404.
4. Compare amount AND currency after taking the lock. If unchanged, return current employee without changing updatedAt or history.
5. For a change, update Employee and insert SalaryHistory using the same transaction client. Generate changedAt after locking; update updatedAt consistently. Commit once both succeed.
6. Concurrent changes must serialize on the employee row. Current salary reflects the last successfully applied transaction; retain each actual intermediate change. This does not promise detection of stale human edits; optimistic concurrency is outside scope.
7. Implement GET /api/employees/:id/salary-history. Verify employee existence, then paginate newest-first by changedAt and id. Ties use id only for deterministic display, not guaranteed commit chronology.
8. Return consistent 400/404/error responses. Expose no history edit/delete route and no generic employee salary update pathway.

## Files
server/src/modules/salaries/salary.routes.js, salary.controller.js, salary.service.js, salary.repository.js, salary.schemas.js.
server/test/unit/salary.service.test.js; server/test/integration/salaries.test.js.

## Tests
- Valid change updates current salary and adds one matching row.
- Currency-only change creates a row; same amount AND currency creates none.
- Missing ID 404; invalid payload 400; history of missing employee 404.
- Force a history failure using a test-only database trigger or real constraint failure; assert current salary AND updatedAt are unchanged and no history remains.
- Two concurrent changes via separate DB connections leave current salary equal to one submitted change and history preserving committed changes; do not assume request arrival is commit order.
- Two concurrent identical updates produce only one change row beyond the initial history.
- History pagination, deterministic ties and full amount precision.

## Acceptance
Rollback and concurrency tests run against real PostgreSQL. Mocked prisma.$transaction alone is not evidence of atomicity.
Commit: feat: implement transactional salary updates and history.

