# 06 — Employee APIs
Prerequisite: 05.

## Steps
1. Write service/validation tests for employee creation. Normalize whitespace, code casing and email casing; preserve human name casing. Enforce maximum lengths.
2. Implement POST /api/employees. Accept only employeeCode, name, email, countryCode, department, level, salaryMinorUnits, currencyCode. Verify currency exists.
3. In one transaction insert employee and initial salary history. Return 201 with EmployeeDTO. Use DB unique constraints as final authority; translate duplicate code/email into 409.
4. Implement GET /api/employees with optional search, country, department, level, page, pageSize. Apply all filters with AND; name/email/code search is an OR inside that.
5. Treat %, _ and backslash as literal search input, not SQL wildcard instructions. Parameterize all values. Prefer repository SQL if Prisma filtering cannot provide the agreed literal semantics.
6. Order by employeeCode then id. Return count and rows from one consistent database snapshot if using separate queries (repeatable-read read transaction); an out-of-range page returns empty data with correct total.
7. Connect filter-options to the controlled values from 05; do not create lookup tables.

## Files
server/src/modules/employees/employee.routes.js, employee.controller.js, employee.service.js, employee.repository.js, employee.schemas.js.
server/test/unit/employee.service.test.js; server/test/integration/employees.test.js.

## Test cases
Valid create → 201 and exactly one matching initial history.
Duplicate normalized code/email → 409 with no extra rows.
Invalid currency/lookup/required field/money → 400.
Force history insert to fail inside a real database transaction → no employee remains.
Search by each supported field, case insensitivity, literal wildcard characters, combined filters, empty results.
Pagination has stable order and no overlap in an unchanged dataset; bounded page sizes and correct total.
SQL-looking search input is treated as data.

## Acceptance
Both endpoints work against seeded PostgreSQL; database supplies pagination; no fetching 10,000 rows into Express to filter.
Commit: feat: add employee creation search and pagination.

