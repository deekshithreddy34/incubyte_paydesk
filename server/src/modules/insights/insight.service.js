import * as insightRepo from './insight.repository.js';
import { serializeRecord } from '../../lib/serialize.js';

export async function getPayInsights(query) {
  const summaries = await insightRepo.calculatePaySummaries(query);

  const data = summaries.map((s) => ({
    group: s.group,
    employeeCount: s.employeeCount,
    averageSalaryUsdMinorUnits: Number(s.averageSalaryUsdMinorUnits),
    minSalaryUsdMinorUnits: Number(s.minSalaryUsdMinorUnits),
    maxSalaryUsdMinorUnits: Number(s.maxSalaryUsdMinorUnits),
  }));

  return {
    data,
    currencyCode: 'USD',
    groupBy: query.groupBy,
  };
}

export async function getPayOutliers(query) {
  const rows = await insightRepo.calculatePayOutliers(query);

  const total = rows.length > 0 ? rows[0].total_outliers : 0;

  const data = rows.map((r) => ({
    employee: serializeRecord({
      id: r.id,
      employeeCode: r.employeeCode,
      name: r.name,
      email: r.email,
      countryCode: r.countryCode,
      department: r.department,
      level: r.level,
      salaryMinorUnits: r.salaryMinorUnits,
      currencyCode: r.currencyCode,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }),
    group: r.grp,
    salaryUsdMinorUnits: Number(r.salary_usd_minor),
    direction: r.direction,
  }));

  return {
    data,
    total,
    page: query.page,
    pageSize: query.pageSize,
    currencyCode: 'USD',
    groupBy: query.groupBy,
    method: 'IQR_1_5',
  };
}

