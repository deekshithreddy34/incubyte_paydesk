# 08 — SQL summaries and outliers
Prerequisite: 07. Goal: correct comparisons using current salaries.

## Steps
1. Implement a reusable SQL filtered-current-employees CTE joined to Currency.
2. Compute usdMajor as salaryMinorUnits::numeric / power(10::numeric, decimalPlaces) * usdRate. Keep NUMERIC arithmetic, no FLOAT/DOUBLE casts.
3. Validate groupBy in country|department|level, default department. Map these values to fixed trusted SQL column fragments. Optional country/department/level filters use the same semantics as employee browsing.
4. GET /api/pay-insights: GROUP BY selected field; compute COUNT, AVG, MIN, MAX over unrounded usdMajor. Round each final monetary output to USD cents half-up. Sort by group label.
5. GET /api/pay-insights/outliers: compute exact quartiles per filtered group in SQL, then strict 1.5×IQR comparisons, then count and paginate outlier rows. Do not compute statistics from only a returned page.
6. Implement quartiles with ordered numeric values and row_number/count: position=1+(n-1)*p for p=.25/.75; interpolate values at floor/ceil positions using NUMERIC. PostgreSQL percentile_cont on double precision can introduce float arithmetic; avoid that for this exact-money contract.
7. Groups with <4 employees yield no outliers. IQR=0 uses the normal strict boundary rule. Rank by employeeCode then id for deterministic pagination.
8. Use fixed-size SQL queries; no N+1 per group. Serialize monetary results with safe-range checks. Add API integration tests for exact fixtures.

## Response contracts
Summary:
{ data: [{ group: "Engineering", employeeCount: 4, averageSalaryUsdMinorUnits: 25000, minSalaryUsdMinorUnits: 10000, maxSalaryUsdMinorUnits: 60000 }], currencyCode: "USD", groupBy: "department" }

Outliers:
{ data: [{ employee: EmployeeDTO, group: "Engineering", salaryUsdMinorUnits: 100000, direction: "HIGH" }], total: 1, page: 1, pageSize: 25, currencyCode: "USD", groupBy: "department", method: "IQR_1_5" }

Empty filtered dataset: data [] (and total 0 for outliers), not zero-valued invented groups.
Outlier determination uses unrounded USD values; rounded display cannot change classification.

## Files
server/src/modules/insights/insight.routes.js, insight.controller.js, insight.service.js, insight.repository.js, insight.schemas.js.
server/test/unit/insight-validation.test.js; server/test/integration/insights.test.js.

## Tests
Mixed currencies representing equal USD amounts; nonzero and zero decimal-place currencies; all grouping modes; combined filters; current salary only despite multiple history rows; one-person summary; empty dataset.
Known sorted USD values [100,100,100,100,1000]: Q1=Q3=100 and only 1000 is HIGH.
[0,10,20,30] as a pure quartile fixture gives Q1=7.5 and Q3=22.5 (zero here is a mathematical test value, not a valid employee salary).
Boundary equality is not an outlier; <4 no outliers; upper/lower outliers; precision near boundary; paginate after classification.
Round average once after AVG; verify against independently calculated fixture values.

## Acceptance
All calculations occur in SQL with bound parameters; expected outputs are hand-derived, not generated with production functions.
Commit: feat: add SQL salary summaries and outlier analysis.

