# 01 — Requirements and fixed decisions
Prerequisite: read 00. Deliverable: docs/requirements.md before implementation.

## Steps
1. Copy the compact requirements below into docs/requirements.md; keep it approximately one page. Commit it before implementation.
2. Record the detailed decisions below in docs/decisions.md and the supplied diagram in docs/architecture/.
3. Create docs/progress.md listing plans 02–12 unchecked.
4. Use these contracts consistently; document justified changes rather than silently diverging.

## One-page requirements text
Goal: help ACME's HR manager maintain salary records for 10,000 employees across countries and understand pay distribution through a web application.

In scope: view and search employees by name/email/code; filter by country, department and level; server-side pagination; add an employee; change annual gross salary and view history; compare average, minimum, maximum and outliers by country, department or level using fixed USD conversion.

Quality: store salary as integer minor units plus currency; save current salary and history in one transaction; compute insights in SQL; use indexed queries and bounded pages; maintain clear layers and deterministic tests; seed the same 10,000 synthetic employees on repeatable runs.

Assumptions: single organisation and one HR persona; every salary is annual gross compensation; fixed illustrative exchange rates; immediate salary changes; no future effective dates. Demo uses synthetic data. Authentication/role management is outside this assessment version; the demo is not suitable for real confidential salary data.

Deliberately deferred: salary-change reasons (context is optional for tracking amounts); general employee editing (outside initial workflows); CSV export (in-app analysis is sufficient); deactivation (requires lifecycle and insights rules). No DELETE endpoint: preserve employee history. Payroll calculations, taxes, payments, approvals and live rates are excluded because they introduce separate domain workflows.

Success: HR can find and add an employee, change salary and inspect history, and inspect correct USD group summaries and outliers in the deployed application. Core rules have meaningful tests and the repository shows incremental work.

## Detailed decisions
- Tables: Employee, SalaryHistory, Currency only.
- Controlled initial values: countries IN, US, GB, JP; departments Engineering, Finance, HR, Sales; levels Junior, Mid, Senior, Lead. Centralize these server-side and expose filter-options.
- Currency does not have to match country; both are explicitly stored.
- Money JSON fields are integer numbers within 1..Number.MAX_SAFE_INTEGER. Database uses BIGINT with the same upper bound. Never accept a float or numeric string for API salaryMinorUnits.
- UI accepts human-readable decimal text and converts exactly to minor units; no parseFloat(value) * 100.
- Fixed demo rates: USD 1.00000000, INR 0.01200000, GBP 1.25000000, JPY 0.00670000. These are test assumptions, not current market rates. Decimal places: 2, 2, 2, 0 respectively.
- Responses display UTC ISO timestamps; UI may localize with an explicit timezone label.
- Salary history starts at creation, is append-only, and omits duplicate entries for an unchanged amount AND currency.
- Current insights use Employee, not historical salary rows.
- Outliers use linear-interpolated quartiles (rank 1 + (n-1)*p), 1.5×IQR, strict outside boundaries; groups smaller than four produce no outliers. IQR zero uses the same rule, including flagging unequal values outside the zero-width interval.
- Group sizes/filters and fixed-rate disclaimer must be visible; outliers are review flags, not evidence of unfairness.
- Missing implementation choices are routine engineering decisions; avoid expanding product scope.

## Acceptance
Requirements exist before feature commits; assumptions and exclusions agree with the diagram and this pack.
Commit: docs: define assessment scope and implementation decisions.

