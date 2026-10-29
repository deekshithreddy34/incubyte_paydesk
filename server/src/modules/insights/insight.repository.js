import { prisma } from '../../db/prisma.js';
import { Prisma } from '@prisma/client';

/**
 * Maps the safe groupBy enum to the exact SQL column identifier.
 * Prevents SQL injection by only allowing fixed, trusted column names.
 */
function getGroupByColumn(groupBy) {
  switch (groupBy) {
    case 'country':
      return Prisma.raw('e."countryCode"');
    case 'level':
      return Prisma.raw('e."level"');
    case 'department':
    default:
      return Prisma.raw('e."department"');
  }
}

/**
 * Builds dynamic WHERE clause filters using parameterized Prisma.sql.
 */
function buildFilterConditions({ country, department, level }) {
  const conditions = [];

  if (country) {
    conditions.push(Prisma.sql`e."countryCode" = ${country}`);
  }
  if (department) {
    conditions.push(Prisma.sql`e."department" = ${department}`);
  }
  if (level) {
    conditions.push(Prisma.sql`e."level" = ${level}`);
  }

  if (conditions.length === 0) {
    return Prisma.empty;
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}

/**
 * Calculates salary summary statistics (COUNT, AVG, MIN, MAX in USD cents)
 * grouped by the chosen dimension (department, country, level).
 * Entire calculation is performed in PostgreSQL with NUMERIC arithmetic.
 */
export async function calculatePaySummaries({ groupBy, country, department, level }) {
  const groupCol = getGroupByColumn(groupBy);
  const filterClause = buildFilterConditions({ country, department, level });

  const query = Prisma.sql`
    WITH current_employees AS (
      SELECT 
        ${groupCol} AS grp,
        (e."salaryMinorUnits"::numeric / power(10::numeric, c."decimalPlaces") * c."usdRate") AS usd_major
      FROM "Employee" e
      JOIN "Currency" c ON e."currencyCode" = c."code"
      ${filterClause}
    )
    SELECT 
      grp AS "group",
      COUNT(*)::int AS "employeeCount",
      ROUND(AVG(usd_major) * 100)::bigint AS "averageSalaryUsdMinorUnits",
      ROUND(MIN(usd_major) * 100)::bigint AS "minSalaryUsdMinorUnits",
      ROUND(MAX(usd_major) * 100)::bigint AS "maxSalaryUsdMinorUnits"
    FROM current_employees
    GROUP BY grp
    ORDER BY grp ASC;
  `;

  return prisma.$queryRaw(query);
}

/**
 * Calculates linear-interpolated quartiles (Q1, Q3) and 1.5 * IQR boundaries in PostgreSQL
 * using exact NUMERIC arithmetic without floating-point conversion.
 * Strictly flags outliers (> Q3 + 1.5*IQR as HIGH, < Q1 - 1.5*IQR as LOW) for groups with >= 4 employees.
 * Returns paginated outlier rows along with the total outlier count.
 */
export async function calculatePayOutliers({ groupBy, country, department, level, page, pageSize }) {
  const groupCol = getGroupByColumn(groupBy);
  const filterClause = buildFilterConditions({ country, department, level });
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // CTE:
  // 1. emp_usd: calculate usd_major and USD minor units for each employee
  // 2. ranked: calculate ordered position rn and count n per group
  // 3. quartiles: compute Q1 (p=0.25) and Q3 (p=0.75) via linear interpolation pos = 1 + (n-1)*p
  // 4. bounds: compute IQR = Q3 - Q1, lower_bound = Q1 - 1.5*IQR, upper_bound = Q3 + 1.5*IQR (only if n >= 4)
  // 5. outliers: strictly filter records where usd_major < lower_bound or usd_major > upper_bound
  const query = Prisma.sql`
    WITH emp_usd AS (
      SELECT 
        e.id,
        e."employeeCode",
        e.name,
        e.email,
        e."countryCode",
        e.department,
        e.level,
        e."salaryMinorUnits",
        e."currencyCode",
        e."createdAt",
        e."updatedAt",
        ${groupCol} AS grp,
        (e."salaryMinorUnits"::numeric / power(10::numeric, c."decimalPlaces") * c."usdRate") AS usd_major,
        ROUND((e."salaryMinorUnits"::numeric / power(10::numeric, c."decimalPlaces") * c."usdRate") * 100)::bigint AS salary_usd_minor
      FROM "Employee" e
      JOIN "Currency" c ON e."currencyCode" = c."code"
      ${filterClause}
    ),
    ranked AS (
      SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY grp ORDER BY usd_major ASC, id ASC) AS rn,
        COUNT(*) OVER (PARTITION BY grp) AS n
      FROM emp_usd
    ),
    quartile_positions AS (
      SELECT 
        grp,
        n,
        1::numeric + (n - 1)::numeric * 0.25 AS p25,
        1::numeric + (n - 1)::numeric * 0.75 AS p75
      FROM ranked
      GROUP BY grp, n
    ),
    q1_components AS (
      SELECT 
        r.grp,
        r.usd_major AS val,
        r.rn,
        qp.p25
      FROM ranked r
      JOIN quartile_positions qp ON r.grp = qp.grp
      WHERE r.rn IN (floor(qp.p25), ceil(qp.p25))
    ),
    q3_components AS (
      SELECT 
        r.grp,
        r.usd_major AS val,
        r.rn,
        qp.p75
      FROM ranked r
      JOIN quartile_positions qp ON r.grp = qp.grp
      WHERE r.rn IN (floor(qp.p75), ceil(qp.p75))
    ),
    q1_values AS (
      SELECT 
        grp,
        CASE 
          WHEN min(val) = max(val) THEN min(val)
          ELSE min(val) + (max(val) - min(val)) * (min(p25) - floor(min(p25)))
        END AS q1
      FROM q1_components
      GROUP BY grp
    ),
    q3_values AS (
      SELECT 
        grp,
        CASE 
          WHEN min(val) = max(val) THEN min(val)
          ELSE min(val) + (max(val) - min(val)) * (min(p75) - floor(min(p75)))
        END AS q3
      FROM q3_components
      GROUP BY grp
    ),
    group_bounds AS (
      SELECT 
        qp.grp,
        qp.n,
        q1.q1,
        q3.q3,
        (q3.q3 - q1.q1) AS iqr,
        (q1.q1 - 1.5 * (q3.q3 - q1.q1)) AS lower_bound,
        (q3.q3 + 1.5 * (q3.q3 - q1.q1)) AS upper_bound
      FROM quartile_positions qp
      JOIN q1_values q1 ON qp.grp = q1.grp
      JOIN q3_values q3 ON qp.grp = q3.grp
    ),
    outliers AS (
      SELECT 
        r.id,
        r."employeeCode",
        r.name,
        r.email,
        r."countryCode",
        r.department,
        r.level,
        r."salaryMinorUnits",
        r."currencyCode",
        r."createdAt",
        r."updatedAt",
        r.grp,
        r.salary_usd_minor,
        CASE 
          WHEN r.usd_major > b.upper_bound THEN 'HIGH'
          WHEN r.usd_major < b.lower_bound THEN 'LOW'
        END AS direction
      FROM ranked r
      JOIN group_bounds b ON r.grp = b.grp
      WHERE b.n >= 4
        AND (r.usd_major > b.upper_bound OR r.usd_major < b.lower_bound)
    )
    SELECT 
      *,
      COUNT(*) OVER()::int AS total_outliers
    FROM outliers
    ORDER BY "employeeCode" ASC, id ASC
    LIMIT ${take} OFFSET ${skip};
  `;

  return prisma.$queryRaw(query);
}

