import { describe, it, expect } from 'vitest';
import { parseSalaryInput, formatSalary } from '../lib/money.js';

describe('Client Money Utilities Unit Tests', () => {
  it('parses decimal inputs to integer minor units correctly', () => {
    expect(parseSalaryInput('600000.50', 2)).toBe(60000050);
    expect(parseSalaryInput('100.00', 2)).toBe(10000);
    expect(parseSalaryInput('5000000', 0)).toBe(5000000);
  });

  it('rejects numbers with more decimal places than allowed by currency', () => {
    // 3 decimal places when 2 are allowed
    expect(() => parseSalaryInput('1.001', 2)).toThrow(/at most 2 decimal places/);
    // Any decimal place when 0 are allowed (JPY)
    expect(() => parseSalaryInput('500.5', 0)).toThrow(/at most 0 decimal places/);
  });

  it('rejects negative, empty, or malformed inputs', () => {
    expect(() => parseSalaryInput('', 2)).toThrow();
    expect(() => parseSalaryInput('-500', 2)).toThrow();
    expect(() => parseSalaryInput('abc', 2)).toThrow();
    expect(() => parseSalaryInput('10.20.30', 2)).toThrow();
  });

  it('formats minor units accurately with currency code without precision loss', () => {
    expect(formatSalary(60000050, 'INR', 2)).toBe('600,000.50 INR');
    expect(formatSalary(5000000, 'JPY', 0)).toBe('5,000,000 JPY');
    expect(formatSalary(10000, 'USD', 2)).toBe('100.00 USD');
  });
});

