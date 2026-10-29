# 03 — Prisma schema, constraints and indexes
Prerequisite: 02. Goal: three tables matching the diagram.

## Steps
1. Configure Prisma for PostgreSQL using the installed major's documented configuration. Run prisma format and validate.
2. Define the tables below. UUID primary keys can use @default(uuid()) with @db.Uuid; seed code will supply deterministic UUIDs.
3. Generate an editable migration, add CHECK constraints and search indexes, then apply it to a clean development database.
4. Add repository mapping for BigInt-to-JSON numbers with explicit safe-range checking.
5. Verify constraints against real PostgreSQL in the isolated test database.

## Schema contract
Employee:
- id String UUID primary key; employeeCode String varchar(30) unique; name String varchar(150); email String varchar(254) unique.
- countryCode String varchar(2); department String varchar(100); level String varchar(50).
- salaryMinorUnits BigInt; currencyCode String varchar(3) FK Currency.code with onDelete Restrict.
- createdAt DateTime default now timestamptz(3); updatedAt DateTime @updatedAt timestamptz(3).
- salaryHistory SalaryHistory[] and currency Currency relation fields.

SalaryHistory:
- id String UUID primary key; employeeId String UUID FK Employee.id with onDelete Restrict.
- salaryMinorUnits BigInt; currencyCode String varchar(3) FK Currency.code with onDelete Restrict.
- changedAt DateTime default now timestamptz(3).
- employee Employee and currency Currency relation fields.

Currency:
- code String varchar(3) primary key; decimalPlaces Int; usdRate Decimal @db.Decimal(18,8).
- employees Employee[] and salaryHistory SalaryHistory[] relation fields.

All scalar fields required. No old/new salary columns, inactive flag or salary reason in this release.

## Database constraints
CHECK salaryMinorUnits BETWEEN 1 AND 9007199254740991 on BOTH salary tables.
CHECK usdRate > 0 and decimalPlaces BETWEEN 0 AND 3.
Validate controlled country/department/level lists at API boundary.
Normalize employeeCode uppercase and email lowercase before saving; enforce unique constraints and translate their violations into HTTP 409.
No cascade deletion of salary records.

## Indexes
B-tree indexes on countryCode, department, level; composite SalaryHistory(employeeId, changedAt, id).
Unique employeeCode/email already create indexes.
For literal case-insensitive substring search, enable pg_trgm and add GIN trigram indexes for name, email and employeeCode using SQL migration. Verify deployment database supports the extension. Short searches may use sequential scans; measure rather than promise index use for every query.
Use EXPLAIN ANALYZE later to justify further composite indexes, not every possible combination.

## Files
server/prisma/schema.prisma; version-appropriate Prisma config; server/prisma/migrations/.../migration.sql; server/src/db/prisma.js; server/src/lib/serialize.js; server/test/integration/schema.test.js.

## Tests
Reject duplicate normalized email/code, missing currency reference, negative/zero/too-large salary, invalid rate. Reject employee deletion with history. Confirm valid amounts round-trip exactly as BigInt.
Use real PostgreSQL; do not replace these checks with mocks.

## Acceptance
Clean migration applies; all constraints and relationships match above; Prisma generate succeeds; schema tests pass.
Commit: feat: add salary schema constraints and query indexes.

