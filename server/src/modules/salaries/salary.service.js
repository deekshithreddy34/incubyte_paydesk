import * as salaryRepo from './salary.repository.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import { serializeRecord } from '../../lib/serialize.js';

export async function updateSalary(id, { salaryMinorUnits, currencyCode }) {
  const normalizedCurrency = currencyCode.trim().toUpperCase();

  // Validate currency exists
  const currency = await salaryRepo.findCurrencyByCode(normalizedCurrency);
  if (!currency) {
    throw new BadRequestError(`Currency '${normalizedCurrency}' is not supported`);
  }

  const result = await salaryRepo.updateSalaryWithHistory(id, salaryMinorUnits, normalizedCurrency);
  if (!result) {
    throw new NotFoundError(`Employee with ID '${id}' not found`);
  }

  return serializeRecord(result.employee);
}

export async function getSalaryHistory(id, { page, pageSize }) {
  const employee = await salaryRepo.findEmployeeById(id);
  if (!employee) {
    throw new NotFoundError(`Employee with ID '${id}' not found`);
  }

  const { total, data } = await salaryRepo.findSalaryHistoryWithCount(id, { page, pageSize });

  return {
    data: serializeRecord(data),
    total,
    page,
    pageSize,
  };
}

