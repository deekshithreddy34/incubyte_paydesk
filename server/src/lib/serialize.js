/**
 * Serializes values containing BigInt or Decimal to JSON-safe numbers or strings.
 * Verifies that BigInt values fall within the JavaScript safe integer range [1, Number.MAX_SAFE_INTEGER].
 */
export function bigIntToNumber(value) {
  if (value === null || value === undefined) return value;
  
  const num = typeof value === 'bigint' ? Number(value) : Number(value);
  if (typeof value === 'bigint' && (value < 1n || value > BigInt(Number.MAX_SAFE_INTEGER))) {
    throw new RangeError(
      `BigInt value ${value} is outside safe integer range [1, ${Number.MAX_SAFE_INTEGER}]`
    );
  }
  return num;
}

/**
 * Deeply transforms an object or array to serialize BigInt and Prisma Decimal values.
 */
export function serializeRecord(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === 'bigint') {
    return bigIntToNumber(data);
  }
  if (typeof data === 'object' && typeof data.toNumber === 'function') {
    // Prisma Decimal
    return data.toNumber();
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(serializeRecord);
  }
  if (typeof data === 'object') {
    const serialized = {};
    for (const [key, val] of Object.entries(data)) {
      serialized[key] = serializeRecord(val);
    }
    return serialized;
  }
  return data;
}

