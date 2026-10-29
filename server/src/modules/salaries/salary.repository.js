import { prisma } from '../../db/prisma.js';

export async function findCurrencyByCode(code) {
  return prisma.currency.findUnique({
    where: { code },
  });
}

export async function findEmployeeById(id) {
  return prisma.employee.findUnique({
    where: { id },
  });
}

/**
 * Updates employee salary atomically with row-level locking (SELECT ... FOR UPDATE).
 * If salaryMinorUnits AND currencyCode are unchanged, skips history insertion and returns current employee.
 */
export async function updateSalaryWithHistory(id, salaryMinorUnits, currencyCode) {
  return prisma.$transaction(async (tx) => {
    // 1. Lock employee row using SELECT ... FOR UPDATE
    const rows = await tx.$queryRaw`
      SELECT id, "employeeCode", name, email, "countryCode", department, level, 
             "salaryMinorUnits", "currencyCode", "createdAt", "updatedAt"
      FROM "Employee"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    if (!rows || rows.length === 0) {
      return null;
    }

    const current = rows[0];
    const newSalaryBigInt = BigInt(salaryMinorUnits);

    // 2. Idempotency check: if amount AND currency are identical, do not touch history or updatedAt
    if (current.salaryMinorUnits === newSalaryBigInt && current.currencyCode === currencyCode) {
      return { employee: current, changed: false };
    }

    const changedAt = new Date();

    // 3. Update employee current salary and timestamp
    const updated = await tx.employee.update({
      where: { id },
      data: {
        salaryMinorUnits: newSalaryBigInt,
        currencyCode,
        updatedAt: changedAt,
      },
    });

    // 4. Insert salary history record
    await tx.salaryHistory.create({
      data: {
        employeeId: id,
        salaryMinorUnits: newSalaryBigInt,
        currencyCode,
        changedAt,
      },
    });

    return { employee: updated, changed: true };
  });
}

/**
 * Finds paginated salary history records newest-first (changedAt DESC, id DESC).
 */
export async function findSalaryHistoryWithCount(employeeId, { page, pageSize }) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return prisma.$transaction(
    async (tx) => {
      const count = await tx.salaryHistory.count({
        where: { employeeId },
      });

      const rows = await tx.salaryHistory.findMany({
        where: { employeeId },
        skip,
        take,
        orderBy: [{ changedAt: 'desc' }, { id: 'desc' }],
      });

      return { total: count, data: rows };
    },
    { isolationLevel: 'RepeatableRead' }
  );
}

