# 09 — React foundation and employee workflows
Prerequisite: 06; API contracts in 05. Use JavaScript and JSX only.

## Steps
1. Configure MUI theme and layout: title “ACME Salary Manager”, navigation Employees / Pay insights, visible synthetic-data demo notice. Use a calm readable table-focused interface.
2. Create an API fetch wrapper for /api, JSON parsing, AbortSignal and consistent error objects. Add TanStack Query provider and keys including every filter/page.
3. Build EmployeesPage: search field, country/department/level dropdowns, clear filters, Add employee button, server-paginated table.
4. Show employee code, name/email, country, department, level, annual gross salary with currency code, and actions Change salary / History. Keep currency labels explicit.
5. Debounce search about 300ms, reset page to 1 when filters change, and cancel obsolete requests. Do not render old response data as if it matched newer filters.
6. Build AddEmployeeDialog with labelled fields, lookup dropdowns and salary text input. Parse text exactly with decimal.js; enforce precision for selected currency. Never silently convert amounts when changing currency.
7. On submit disable duplicate submissions, retain input on error, display field/conflict errors, and invalidate employee lists and insights after success. Close dialog only on success.
8. Include initial loading, background refreshing, empty list, no-match and retryable error states. Preserve keyboard focus when opening/closing dialogs.

## Files
client/src/app/providers.jsx; client/src/app/theme.js; client/src/api/client.js; client/src/api/employees.js; client/src/hooks/useEmployees.js; client/src/pages/EmployeesPage.jsx; client/src/components/EmployeeTable.jsx; EmployeeFilters.jsx; AddEmployeeDialog.jsx; Pagination.jsx; client/src/lib/money.js.

## Tests
React Testing Library + MSW: filter changes send expected query and reset page; stale search response is not shown; create success/error; duplicate submit disabled; API conflict message; loading/empty/error/retry; keyboard-accessible labels and dialog.
Money parsing: "600000.50" INR → 60000050; reject "1.001" INR, fractional JPY, unsafe amount and malformed strings. Format stored amounts without losing precision; include currency code.

## Acceptance
UI uses live APIs, not hardcoded arrays; only one page of employees is requested; form values and money remain correct through errors.
Commit: feat: build employee directory and add employee workflow.

