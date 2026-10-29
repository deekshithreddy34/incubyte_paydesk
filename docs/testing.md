# Testing Strategy & Guarantees

This document details the test strategy, execution tiers, test environments, and safety guarantees implemented in ACME PayDesk.

---

## 1. Testing Pyramid & Test Tiers

The test suite is structured into three cleanly separated tiers:

```
          / \
         / E2E \        Playwright Browser Tests (Happy-path user flows)
        /-------\
       / Integr. \      PostgreSQL Integration Tests (Transactions, SQL, APIs)
      /-----------\
     / Unit/Comp.  \    Pure Unit & React Component Tests (Fast, In-Memory)
    /---------------\
```

### Tier 1: Unit & Component Tests
- **Zero Database / Network Dependency**: Executes instantaneously without any running services.
- **Server Unit**: Tests money conversions (`decimalStringToMinorUnits`, `convertToUsdCents`), Zod validation schemas, safe BigInt serialization, and PRNG seed math.
  - Run via: `npm --prefix server run test:unit`
- **Client Unit & Component**: Tests client money formatting, math precision, and React UI components (e.g., `<Pagination />`, `<EmployeeFilters />`).
  - Run via: `npm --prefix client test`

### Tier 2: PostgreSQL Integration Tests
- **Real Database Environment**: Uses a dedicated, isolated test database (`acme_salary_test`).
- **Safety Guard**: `server/test/helpers/database.js` inspects connection strings before any destructive reset; refuses execution if pointed at development (`acme_salary_dev`) or production databases.
- **Sequential Execution**: Configured with `--fileParallelism=false` in Vitest to guarantee deterministic cleanup without fixture collision.
- **Real Transactions & Concurrency**: Tests row-level locks (`SELECT ... FOR UPDATE`), transaction rollback, and concurrent salary updates.
  - Run via: `npm --prefix server run test:integration`

### Tier 3: End-to-End (E2E) Browser Tests
- **Playwright Automation**: Exercises the full stack (Vite client + Express API + PostgreSQL database).
- **Core Scenarios Tested**:
  1. Employee Directory browsing, multi-column search with debounce, dropdown filtering, and pagination.
  2. Creating a new employee with valid money input.
  3. Modifying an employee salary and verifying instant reflected salary update and audit history drawer.
  4. Viewing grouped Pay Insights (Count, Mean, Min, Max in USD) and Statistical Outlier detection ($1.5 \times IQR$ rule).

---

## 2. Test Execution Commands

| Scope | Command | Requires DB | Execution Time |
| :--- | :--- | :--- | :--- |
| **Server Unit Tests** | `npm --prefix server run test:unit` | ❌ No | ~1.5s |
| **Client Tests** | `npm --prefix client test` | ❌ No | ~5s |
| **Server Integration Tests** | `npm --prefix server run test:integration` | ✅ Yes (test DB) | ~12s |
| **Benchmark Script** | `node server/scripts/benchmark.js` | ✅ Yes (seeded DB) | ~7s |

---

## 3. Guarantees & Verification Principles

1. **Exact Integer Minor Units**: All monetary values are asserted as exact safe integers in database and schema tests; floating-point representation is forbidden.
2. **Transaction Rollback**: Failures during employee creation or salary updates are tested to ensure zero partial writes.
3. **Audit Trail Completeness**: Every salary change is tested to assert an immutable `SalaryHistory` entry with timestamp, old salary, new salary, and reason.
4. **Outlier Precision**: Quartiles computed via linear interpolation ($pos = 1 + (n-1) \times p$) are tested against known statistical test cases.

