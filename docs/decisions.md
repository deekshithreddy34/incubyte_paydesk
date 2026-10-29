# Implementation Decisions — ACME Salary Management

> Refer to the [system architecture diagram](architecture/SALARYMANAGEMENT_INCUBYTE.png) and its [detailed breakdown](architecture/README.md) for the visual reference these decisions are derived from.

## Data model

- **Tables**: Employee, SalaryHistory, Currency only.
- **Controlled initial values**:
  - Countries: IN, US, GB, JP.
  - Departments: Engineering, Finance, HR, Sales.
  - Levels: Junior, Mid, Senior, Lead.
- Centralize these server-side and expose via a filter-options endpoint.
- Currency does not have to match country; both are explicitly stored.

### Schema (from diagram)

**Employee**: id, employeeCode, name, email, countryCode, department, level, salaryMinorUnits, currencyCode, createdAt, updatedAt

**SalaryHistory**: id, employeeId, salaryMinorUnits, currencyCode, changedAt

**Currency**: code, decimalPlaces, usdRate

## API surface (from diagram)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/employees | View, search, filter, and paginate employees |
| POST | /api/employees | Add an employee and their initial salary history |
| PATCH | /api/employees/:id/salary | Change salary and record history |
| GET | /api/employees/:id/salary-history | View paginated salary history |
| GET | /api/pay-insights | Average, minimum, and maximum salaries by group |
| GET | /api/pay-insights/outliers | View paginated salary outliers |
| GET | /api/filter-options | Get allowed countries, departments, levels, and currencies |

## Money representation

- Money JSON fields are integer numbers within `1..Number.MAX_SAFE_INTEGER`.
- Database uses BIGINT with the same upper bound.
- Never accept a float or numeric string for API `salaryMinorUnits`.
- UI accepts human-readable decimal text and converts exactly to minor units; no `parseFloat(value) * 100`.

## Exchange rates (fixed demo rates)

| Currency | Rate to USD     | Decimal places |
| -------- | --------------- | -------------- |
| USD      | 1.00000000      | 2              |
| INR      | 0.01200000      | 2              |
| GBP      | 1.25000000      | 2              |
| JPY      | 0.00670000      | 0              |

These are test assumptions, not current market rates.

## Timestamps

- Responses display UTC ISO timestamps.
- UI may localize with an explicit timezone label.

## Salary history

- Salary history starts at creation, is append-only, and omits duplicate entries for an unchanged amount AND currency.
- Current insights use the Employee table, not historical salary rows.

## Outlier detection

- Outliers use linear-interpolated quartiles (rank `1 + (n−1)×p`), 1.5×IQR, strict outside boundaries.
- Groups smaller than four produce no outliers.
- IQR zero uses the same rule, including flagging unequal values outside the zero-width interval.

## UX transparency

- Group sizes/filters and fixed-rate disclaimer must be visible.
- Outliers are review flags, not evidence of unfairness.

## Architecture

- One repository with `client/` and `server/` packages (npm workspaces), single root `package-lock.json`.
- Stack: React JSX, Express ES modules, PostgreSQL, Prisma. JavaScript only — no TypeScript.
- Layers: Routes → Controllers → Services → Repositories inside one Express process.
- Browser never accesses the database directly.
- No TypeScript, microservices, Redis, queues, Elasticsearch, or generic repository framework.
- JavaScript configuration files only.

## Scope discipline

- Missing implementation choices are routine engineering decisions; avoid expanding product scope.
- Document justified changes rather than silently diverging from these contracts.

