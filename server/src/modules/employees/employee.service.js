import * as employeeRepo from './employee.repository.js';
import { BadRequestError, ConflictError } from '../../lib/errors.js';
import { serializeRecord } from '../../lib/serialize.js';

export function normalizeEmployeeInput(input) {
  return {
    ...input,
    employeeCode: input.employeeCode.trim().toUpperCase(),
    name: input.name.trim(), // preserve human casing
    email: input.email.trim().toLowerCase(),
    countryCode: input.countryCode.trim().toUpperCase(),
    department: input.department.trim(),
    level: input.level.trim(),
    currencyCode: input.currencyCode.trim().toUpperCase(),
  };
}

export async function createEmployee(data) {
  const normalized = normalizeEmployeeInput(data);

  // Check currency existence
  const currency = await employeeRepo.findCurrencyByCode(normalized.currencyCode);
  if (!currency) {
    throw new BadRequestError(`Currency '${normalized.currencyCode}' is not supported`);
  }

  try {
    const created = await employeeRepo.createEmployeeWithHistory(normalized);
    return serializeRecord(created);
  } catch (error) {
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      const fieldsStr = Array.isArray(target) ? target.join(', ') : target;
      throw new ConflictError(`Employee with duplicate ${fieldsStr} already exists`);
    }
    throw error;
  }
}

export async function getEmployees(query) {
  const { total, data } = await employeeRepo.findEmployeesWithCount(query);
  return {
    data: serializeRecord(data),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

