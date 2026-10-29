# 14 — Requirement-to-test checklist
Use throughout implementation; mark actual evidence in docs/testing.md.

| Requirement | Implementation owner | Required evidence |
|---|---|---|
| View/search/filter employees | 06 + 09 | Each field search, literal wildcard handling, combined filters, page reset, no stale responses |
| Add employee | 06 + 09 | 201 response, one initial history, duplicate rejection, failed history rolls back creation |
| Change salary and see history | 07 + 10 | Correct history, no-op, currency-only change, pagination, rollback and concurrency |
| Average/min/max by group | 08 + 10 | Known mixed-currency fixtures for all three groupings, current salary only, empty groups |
| Outliers | 08 + 10 | Quartile interpolation, boundary equality, <4, zero IQR, lower/upper, pagination after classification |
| Fast 10k browsing | 03 + 11 | Pagination, indexes, measured query plans and p95 |
| Atomic salary changes | 07 | Real database rollback and concurrent update tests |
| Accurate money | 03 + 05 + 08 | BigInt boundaries, integer API inputs, exact minor-unit parse, numeric SQL, one final rounding |
| Read-heavy workload | 06 + 08 | Bounded rows, no N+1, no unnecessary cache invalidation gaps after writes |
| SQL insights | 08 | Actual PostgreSQL query tests; no browser aggregation |
| Maintainability | 02 + all | Routes/controllers/services/repositories with clear responsibilities and no generic framework |
| Deterministic tests | 11 | Fixed fixtures/time, isolated database, no live service dependency |
| Repeatable seed | 04 | Exactly 10k with identical sorted hashes on two explicit resets |
| Deployed full stack | 12 | Live write/read/history/insight smoke checks |
| Incremental commits and AI use | 00 + 12 | Genuine feature evolution and concise AI decision log |

## Suggested review questions
- Does every monetary API field obey the same minor-unit contract?
- Does every transaction query use the transaction client?
- Does aggregate computation include the whole filtered dataset?
- Does editing a salary refresh employee, history and insights views?
- Can tests accidentally touch real/demo data?
- Are all deferred features still deferred?
- Can a new reviewer run this from README without guessing configuration?

## Completion record template
Plan:
Commit:
Commands executed:
Passed:
Failed/not run:
Known limitations:
Next plan:

