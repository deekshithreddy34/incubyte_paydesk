import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

/**
 * Formats integer minor units into a localized human-readable string with currency symbol/code.
 * E.g., 8500050 minor units (USD, 2 dec) -> "$85,000.50 USD"
 * E.g., 500000 minor units (JPY, 0 dec) -> "500,000 JPY"
 */
export function formatSalary(minorUnits, currencyCode = 'USD', decimalPlaces = 2) {
  if (minorUnits === null || minorUnits === undefined) return '';

  const d = new Decimal(minorUnits.toString()).div(new Decimal(10).pow(decimalPlaces));

  const numPart = d.toNumber().toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return `${numPart} ${currencyCode}`;
}

/**
 * Parses user decimal input text into whole integer minor units.
 * Validates that there are no extra fractional decimals beyond the allowed currency precision.
 */
export function parseSalaryInput(amountText, decimalPlaces = 2) {
  if (typeof amountText !== 'string' || amountText.trim() === '') {
    throw new Error('Salary amount is required');
  }

  const clean = amountText.trim();

  // Validate decimal places syntax
  const parts = clean.split('.');
  if (parts.length > 2) {
    throw new Error('Invalid number format');
  }

  if (parts.length === 2 && parts[1].length > decimalPlaces) {
    throw new Error(
      `Currency supports at most ${decimalPlaces} decimal place${decimalPlaces === 1 ? '' : 's'}`
    );
  }

  const d = new Decimal(clean);
  if (d.isNaN() || !d.isFinite()) {
    throw new Error('Please enter a valid numeric amount');
  }

  const minor = d.mul(new Decimal(10).pow(decimalPlaces)).round();

  if (minor.isNeg() || minor.isZero()) {
    throw new Error('Salary must be greater than zero');
  }

  if (minor.gt(new Decimal(Number.MAX_SAFE_INTEGER))) {
    throw new Error('Salary exceeds maximum allowable amount');
  }

  return minor.toNumber();
}

