import { prisma } from '../../db/prisma.js';

export async function findCurrencyByCode(code) {
  return prisma.currency.findUnique({
    where: { code },
  });
}

export async function createEmployeeWithHistory(employeeData) {
  return prisma.$transaction(async (tx) => {
    // 1. Create employee
    const employee = await tx.employee.create({
      data: {
        employeeCode: employeeData.employeeCode,
        name: employeeData.name,
        email: employeeData.email,
        countryCode: employeeData.countryCode,
        department: employeeData.department,
        level: employeeData.level,
        salaryMinorUnits: BigInt(employeeData.salaryMinorUnits),
        currencyCode: employeeData.currencyCode,
      },
    });

    // 2. Create matching initial salary history record
    await tx.salaryHistory.create({
      data: {
        employeeId: employee.id,
        salaryMinorUnits: employee.salaryMinorUnits,
        currencyCode: employee.currencyCode,
        changedAt: employee.createdAt,
      },
    });

    return employee;
  });
}

/**
 * Escapes characters that have special meaning in SQL LIKE / ILIKE patterns: '%', '_', and '\'.
 */
function escapeLikePattern(str) {
  return str.replace(/[\\%_]/g, '\\$&');
}

/**
 * Finds employees matching optional search substring, country, department, level,
 * with database-level pagination in a repeatable-read snapshot transaction.
 */
export async function findEmployeesWithCount({ search, country, department, level, page, pageSize }) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Build filter conditions
  const whereConditions = [];

  if (country) {
    whereConditions.push({ countryCode: country });
  }
  if (department) {
    whereConditions.push({ department });
  }
  if (level) {
    whereConditions.push({ level });
  }

  if (search && search.trim() !== '') {
    const rawSearch = search.trim();
    whereConditions.push({
      OR: [
        { name: { contains: rawSearch, mode: 'insensitive' } },
        { email: { contains: rawSearch, mode: 'insensitive' } },
        { employeeCode: { contains: rawSearch, mode: 'insensitive' } },
      ],
    });
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Execute count and paginated query inside a transaction for consistent snapshot
  const [total, data] = await prisma.$transaction(
    async (tx) => {
      const count = await tx.employee.count({ where });
      const rows = await tx.employee.findMany({
        where,
        skip,
        take,
        orderBy: [{ employeeCode: 'asc' }, { id: 'asc' }],
      });
      return [count, rows];
    },
    {
      isolationLevel: 'RepeatableRead',
    }
  );

  return { total, data };
}

