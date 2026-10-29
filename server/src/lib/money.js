import Decimal from 'decimal.js';

// Configure Decimal.js: 28 digits precision, ROUND_HALF_UP (standard financial rounding)
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

/**
 * Parses a human-readable decimal amount string into integer minor units without float inaccuracies.
 * E.g., "85000.50" with 2 decimal places -> 8500050
 * E.g., "500000" with 0 decimal places (JPY) -> 500000
 */
export function decimalStringToMinorUnits(amountStr, decimalPlaces = 2) {
  if (typeof amountStr !== 'string' || amountStr.trim() === '') {
    throw new Error('Amount must be a non-empty string');
  }

  const d = new Decimal(amountStr.trim());
  if (d.isNaN() || !d.isFinite()) {
    throw new Error('Invalid numeric decimal format');
  }

  const multiplier = new Decimal(10).pow(decimalPlaces);
  const minor = d.mul(multiplier).round();

  if (minor.isNeg() || minor.isZero()) {
    throw new Error('Amount must be strictly positive');
  }

  const maxSafe = new Decimal(Number.MAX_SAFE_INTEGER);
  if (minor.gt(maxSafe)) {
    throw new Error(`Amount exceeds maximum safe integer ${Number.MAX_SAFE_INTEGER}`);
  }

  return minor.toNumber();
}

/**
 * Converts minor units of a given currency into USD minor units (cents) using exact Decimal math.
 * Applies fixed usdRate and rounds to the nearest integer cent using half-up at the boundary.
 *
 * Examples:
 * - INR 10,000 paise (100 INR) with rate 0.012 -> 120 cents
 * - JPY 100 yen (0 dec) with rate 0.0067 -> 67 cents
 * - USD 101 cents (2 dec) with rate 1.00000000 -> 101 cents
 */
export function convertToUsdCents(salaryMinorUnits, usdRate, fromDecimalPlaces = 2) {
  const amountMinor = new Decimal(salaryMinorUnits.toString());
  const rate = new Decimal(usdRate.toString());

  // Step 1: Base currency amount in major units = amountMinor / (10^fromDecimalPlaces)
  const majorAmount = amountMinor.div(new Decimal(10).pow(fromDecimalPlaces));

  // Step 2: USD major amount = majorAmount * usdRate
  const usdMajor = majorAmount.mul(rate);

  // Step 3: USD minor units (cents) = usdMajor * 100, rounded half-up
  const usdCents = usdMajor.mul(100).round();

  return usdCents.toNumber();
}

