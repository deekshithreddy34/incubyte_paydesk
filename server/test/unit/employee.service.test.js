import { describe, it, expect } from 'vitest';
import { normalizeEmployeeInput } from '../../src/modules/employees/employee.service.js';

describe('Employee Service Unit Tests', () => {
  it('normalizes whitespace, casing for code/email/country/currency while preserving human name casing', () => {
    const raw = {
      employeeCode: '  acme-09999  ',
      name: '  Dr. Jane O\'Connor-Smith  ',
      email: '  Jane.Smith@Example.COM  ',
      countryCode: '  us  ',
      department: '  Engineering  ',
      level: '  Senior  ',
      salaryMinorUnits: 15000000,
      currencyCode: '  usd  ',
    };

    const normalized = normalizeEmployeeInput(raw);

    expect(normalized.employeeCode).toBe('ACME-09999');
    expect(normalized.name).toBe('Dr. Jane O\'Connor-Smith');
    expect(normalized.email).toBe('jane.smith@example.com');
    expect(normalized.countryCode).toBe('US');
    expect(normalized.department).toBe('Engineering');
    expect(normalized.level).toBe('Senior');
    expect(normalized.currencyCode).toBe('USD');
  });
});

