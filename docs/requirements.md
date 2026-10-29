# Requirements — ACME Salary Management

## Goal

Help ACME's HR manager maintain salary records for 10,000 employees across countries and understand pay distribution through a web application.

## In scope

- View and search employees by name, email or employee code.
- Filter by country, department and level.
- Server-side pagination.
- Add an employee.
- Change annual gross salary and view history.
- Compare average, minimum, maximum and outliers by country, department or level using fixed USD conversion.

## Quality

- Store salary as integer minor units plus currency.
- Save current salary and history in one transaction.
- Compute insights in SQL.
- Use indexed queries and bounded pages.
- Maintain clear layers and deterministic tests.
- Seed the same 10,000 synthetic employees on repeatable runs.

## Assumptions

- Single organisation and one HR persona.
- Every salary is annual gross compensation.
- Fixed illustrative exchange rates.
- Immediate salary changes; no future effective dates.
- Demo uses synthetic data.
- Authentication and role management are outside this assessment version; the demo is not suitable for real confidential salary data.

## Deliberately deferred

- Salary-change reasons (context is optional for tracking amounts).
- General employee editing (outside initial workflows).
- CSV export (in-app analysis is sufficient).
- Deactivation (requires lifecycle and insights rules).
- No DELETE endpoint: preserve employee history.
- Payroll calculations, taxes, payments, approvals and live rates are excluded because they introduce separate domain workflows.

## Success criteria

HR can find and add an employee, change salary and inspect history, and inspect correct USD group summaries and outliers in the deployed application. Core rules have meaningful tests and the repository shows incremental work.

## Reference

See the [system architecture diagram](architecture/SALARYMANAGEMENT_INCUBYTE.png) for the visual specification these requirements are derived from.

