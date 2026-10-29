# 10 — React salary history and pay insights
Prerequisite: 07, 08, 09.

## Steps
1. Build ChangeSalaryDialog from the selected table row. Show current annual salary/currency and inputs for new amount/currency. Explain that this takes effect immediately.
2. Submit only to PATCH /employees/:id/salary. Disable duplicate clicks, preserve form on failure and show success. On success invalidate employee lists, that employee's history, summaries and outliers.
3. Build SalaryHistoryDrawer using the history API with server pagination, newest-first. Show amount, currency and timestamp; initial row is the original salary. No edit/delete controls.
4. Build PayInsightsPage with groupBy dropdown and country/department/level filters. Show group name, employee count, average/minimum/maximum USD salary.
5. Display a clear note: annual gross salaries converted using fixed illustrative USD rates. Data describes current salaries only.
6. Add outlier table with employee, selected group, USD salary and HIGH/LOW flag. Show the IQR explanation and minimum group size; flags invite review rather than make a fairness judgement.
7. Reset outlier pagination on any filter/group change. Use matching query parameters for summary and outliers.
8. Add accessible loading/error/empty/retry states and responsive horizontal table scrolling. A chart is optional, not required; don't add a chart library just for decoration.

## Files
client/src/components/ChangeSalaryDialog.jsx; SalaryHistoryDrawer.jsx; client/src/pages/PayInsightsPage.jsx; client/src/components/InsightsTable.jsx; OutliersTable.jsx; client/src/api/salaries.js; insights.js; client/src/hooks/useSalaryHistory.js; useInsights.js.

## Tests
Salary successful update refreshes all affected views; failure leaves displayed committed values unchanged; no-op update works; history pagination.
Group/filter changes reach both APIs; totals/labels reflect response; USD disclaimer visible; empty outlier list; missing employee error; stale responses ignored.
Use MSW for component tests and real services in later E2E tests.

## Acceptance
All diagram workflows are usable from the UI; no client-side aggregation over the full dataset; no future-scope controls.
Commit: feat: build salary history and pay insights screens.

