import { describe, it, expect } from 'vitest';
import { decimalStringToMinorUnits, convertToUsdCents } from '../../src/lib/money.js';

describe('Money Helpers Unit Tests', () => {
  describe('decimalStringToMinorUnits', () => {
    it('accurately parses standard 2-decimal inputs without floating-point errors', () => {
      expect(decimalStringToMinorUnits('85000.50', 2)).toBe(8500050);
      expect(decimalStringToMinorUnits('0.01', 2)).toBe(1);
      expect(decimalStringToMinorUnits('100.99', 2)).toBe(10099);
      expect(decimalStringToMinorUnits('123456.78', 2)).toBe(12345678);
    });

    it('accurately parses 0-decimal inputs (e.g. JPY)', () => {
      expect(decimalStringToMinorUnits('500000', 0)).toBe(500000);
      expect(decimalStringToMinorUnits('12000000', 0)).toBe(12000000);
    });

    it('rejects invalid, empty, or negative inputs', () => {
      expect(() => decimalStringToMinorUnits('', 2)).toThrow();
      expect(() => decimalStringToMinorUnits('abc', 2)).toThrow();
      expect(() => decimalStringToMinorUnits('-50.00', 2)).toThrow();
      expect(() => decimalStringToMinorUnits('0', 2)).toThrow();
    });

    it('rejects inputs exceeding Number.MAX_SAFE_INTEGER', () => {
      expect(() => decimalStringToMinorUnits('999999999999999999', 2)).toThrow();
    });
  });

  describe('convertToUsdCents', () => {
    it('converts exact fixtures as specified in Plan 05', () => {
      // INR 10,000 paise (100 INR) at 0.012 gives 120 USD cents
      expect(convertToUsdCents(10000, '0.01200000', 2)).toBe(120);

      // JPY 100 yen (0 decimal places) at 0.0067 gives 67 USD cents
      expect(convertToUsdCents(100, '0.00670000', 0)).toBe(67);

      // USD 101 cents at 1.00000000 remains 101 cents
      expect(convertToUsdCents(101, '1.00000000', 2)).toBe(101);
    });

    it('rounds half-up at the half cent boundary', () => {
      // 120.5 cents -> 121 cents
      // 100.4 cents -> 100 cents
      // Example: rate 0.0125 on 10000 minor units (100 major) = 1.25 USD = 125 cents
      expect(convertToUsdCents(10000, '0.01250000', 2)).toBe(125);
    });
  });
});

