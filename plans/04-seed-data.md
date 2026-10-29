# 04 — Reproducible 10,000-employee seed
Prerequisite: 03.

## Steps
1. Create a pure generateSeedData function accepting a fixed seed and a fixed base timestamp. Use a small deterministic PRNG or seeded generator with pinned version. Never use Math.random, Date.now or uncontrolled UUID generation.
2. Build exactly 10,000 employee objects with stable UUIDs derived from index/namespace, codes ACME-00001 through ACME-10000, unique synthetic emails at example.com, and explicit timestamps.
3. Distribute countries/departments/levels reproducibly. Include each supported currency, realistic-looking synthetic salary ranges, repeated salaries and a few known outliers. Do not claim generated values are market benchmarks.
4. Generate exactly one initial history row per employee with deterministic ID, matching amount/currency, and matching initial timestamp.
5. Insert fixed currencies first, then employees and histories in bounded batches. For a demo reset command, explicitly require a seed reset flag and a development/test or designated demo database; delete history before employees. Never automatically reset during app startup or deployment.
6. Document that repeatability means a clean/reset demo dataset has identical sorted row content. A run without explicit reset must refuse a nonempty employee dataset rather than overwrite HR edits.

## Files
server/prisma/seed.js; server/prisma/seed-data.js; server/src/config/lookups.js; server/test/unit/seed-data.test.js; server/test/integration/seed.test.js.

## Tests
- Same seed produces byte-equivalent sorted objects; different seed changes generated salary distribution.
- Exactly 10,000 employees and histories; unique IDs, codes and emails.
- All controlled values and amounts are valid.
- Each current salary matches its initial history.
- Two explicit resets yield matching canonical hashes excluding no fields (timestamps are fixed).
- Default seed command refuses populated employee data.
Run the expensive full database seed check separately from fast unit tests.

## Acceptance
Documented db:seed/reset invocation yields the required dataset; no accidental production reset pathway.
Commit: feat: seed deterministic employee and salary history data.

