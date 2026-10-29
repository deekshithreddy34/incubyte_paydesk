# 13 — Deferred improvements (do not implement in version one)

These are separate future increments, in the agreed order. Current scope remains the seven product endpoints and three tables. Each future feature needs its own tests and migration where relevant.

## 1. Salary-change reason
Reason deferred: current history already captures amount, currency and time; additional context is useful but not required for tracking salary changes.
Steps:
1. Add nullable reason text to SalaryHistory with an agreed length limit (for example 500 characters).
2. Accept optional reason in the dedicated salary update body and add a form field.
3. Persist it only when a real salary change creates a history entry.
4. Display it in history; existing rows stay null.
Tests: omitted/valid/overlong reason; preserved with transaction; rollback; unchanged salary does not create a reason-only entry.
Acceptance: old clients still work and original history remains readable.
Suggested commit: feat: record optional salary change reasons.

## 2. Employee detail editing
Reason deferred: initial workflows cover creation and salary changes; profile maintenance is an independent enhancement.
Steps:
1. Add PATCH /api/employees/:id with allowlisted name, email, department and level.
2. Reject salaryMinorUnits and currencyCode; keep employeeCode fixed for this increment.
3. Normalize/validate fields, handle duplicate emails and update updatedAt.
4. Add edit dialog and invalidate lists and pay insights because group membership may change.
Tests: one/multiple allowed fields; missing employee; duplicate normalized email; forbidden salary fields; salary/history untouched; department/level changes reflected in summaries.
Acceptance: employee edits cannot bypass salary history rules.
Suggested commit: feat: edit employee profile details.

## 3. CSV export
Reason deferred: HR can already view and analyse records in-app; downloading is additional convenience.
Steps:
1. Add GET /api/employees/export with existing filters/search and no page limitation.
2. Export all matching rows, not just the current page. Use stable ordering and bounded batches/streaming.
3. Include code, name, email, country, department, level, annual salary and currency, with clear column headers.
4. Quote commas/newlines/quotes correctly and protect spreadsheet formula injection for text cells beginning with =, +, -, @ or relevant control characters.
5. Add Export button preserving current filters and loading/error handling.
Tests: identical filter semantics; all pages included; Unicode, commas, quotes, newlines; formula-like names; exact money representation; empty export headers.
Acceptance: downloaded file opens correctly and matches selected filters.
Suggested commit: feat: export filtered employees as CSV.

## 4. Employee deactivation
Reason deferred: lifecycle management introduces rules about visibility and current pay insights.
Steps:
1. Add isActive Boolean default true and deactivatedAt nullable timestamp via migration.
2. Add a dedicated deactivation action; repeated requests are idempotent.
3. Default directory/insights to active employees and add active/inactive/all directory filter.
4. Keep salary history accessible, forbid new salary changes for inactive employees, and retain all records.
5. Serialize deactivation and salary changes on the same employee row so the rules hold concurrently.
6. Do not add hard deletion or reactivation unless separately requested.
Tests: existing employees migrate active; deactivation keeps history; excludes current insights; repeated deactivation; inactive salary rejection; concurrency.
Acceptance: no record loss and all current-pay summaries consistently exclude inactive employees.
Suggested commit: feat: deactivate employees while preserving history.

