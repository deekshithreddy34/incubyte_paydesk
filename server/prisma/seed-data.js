import {
  ALLOWED_COUNTRIES,
  ALLOWED_DEPARTMENTS,
  ALLOWED_LEVELS,
  CURRENCIES,
} from '../src/config/lookups.js';

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 */
export function createRng(seed = 42) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic pseudo-UUID v4 generator derived from an entity prefix/type and numerical index.
 */
export function generateDeterministicUuid(type, index) {
  // Pad index to 8 hex characters
  const hexIndex = index.toString(16).padStart(8, '0');
  // Type identifier: 1000 for employee, 2000 for salary_history
  const typeHex = type === 'employee' ? '1000' : '2000';
  return `${hexIndex}-${typeHex}-4000-8000-${hexIndex.padStart(12, '0')}`;
}

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Alex', 'Amara', 'Arjun', 'Benjamin', 'Chloe', 'Daniel',
  'Elena', 'Emma', 'Hiroshi', 'Ishaan', 'James', 'Kenji', 'Liam', 'Maya',
  'Mia', 'Noah', 'Olivia', 'Pooja', 'Priya', 'Rahul', 'Rohan', 'Sakura',
  'Sara', 'Sophia', 'Takeshi', 'Yuki', 'Zara', 'Oliver', 'Lucas', 'Ethan'
];

const LAST_NAMES = [
  'Smith', 'Patel', 'Sharma', 'Jones', 'Williams', 'Brown', 'Tanaka', 'Sato',
  'Suzuki', 'Takahashi', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts',
  'Gupta', 'Verma', 'Kumar', 'Singh', 'Johnson', 'Miller', 'Davis', 'Rodriguez'
];

// Typical salary minor units range by level and currency (annual gross compensation)
// USD: Junior ~ $40k-$70k, Mid ~ $70k-$120k, Senior ~ $120k-$180k, Lead ~ $180k-$250k
// INR: Junior ~ ₹4L-₹8L, Mid ~ ₹8L-₹18L, Senior ~ ₹18L-₹35L, Lead ~ ₹35L-₹65L
// GBP: Junior ~ £25k-£45k, Mid ~ £45k-£80k, Senior ~ £80k-$120k, Lead ~ £120k-$170k
// JPY: Junior ~ ¥3.5M-¥5.5M, Mid ~ ¥5.5M-¥9M, Senior ~ ¥9M-¥15M, Lead ~ ¥15M-¥22M
const BASE_SALARY_RANGES = {
  USD: {
    Junior: [4000000n, 7000000n],
    Mid: [7000000n, 12000000n],
    Senior: [12000000n, 18000000n],
    Lead: [18000000n, 25000000n],
  },
  INR: {
    Junior: [40000000n, 80000000n],
    Mid: [80000000n, 180000000n],
    Senior: [180000000n, 350000000n],
    Lead: [350000000n, 650000000n],
  },
  GBP: {
    Junior: [2500000n, 4500000n],
    Mid: [4500000n, 8000000n],
    Senior: [8000000n, 12000000n],
    Lead: [12000000n, 17000000n],
  },
  JPY: {
    Junior: [3500000n, 5500000n],
    Mid: [5500000n, 9000000n],
    Senior: [9000000n, 15000000n],
    Lead: [15000000n, 22000000n],
  },
};

const COUNTRY_CURRENCY_AFFINITY = {
  IN: ['INR', 'INR', 'INR', 'USD'], // mostly INR, occasionally USD
  US: ['USD', 'USD', 'USD', 'USD'], // USD
  GB: ['GBP', 'GBP', 'GBP', 'USD'], // mostly GBP, occasionally USD
  JP: ['JPY', 'JPY', 'JPY', 'USD'], // mostly JPY, occasionally USD
};

/**
 * Pure deterministic generator for exactly count employees and their initial salary history.
 */
export function generateSeedData({
  count = 10000,
  seed = 42,
  baseTimestamp = '2026-01-01T00:00:00.000Z',
} = {}) {
  const rng = createRng(seed);
  const baseTime = new Date(baseTimestamp).getTime();

  const employees = [];
  const salaryHistories = [];

  for (let i = 1; i <= count; i++) {
    const employeeId = generateDeterministicUuid('employee', i);
    const historyId = generateDeterministicUuid('salary_history', i);
    const employeeCode = `ACME-${i.toString().padStart(5, '0')}`;

    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    const email = `employee.${i}.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    const countryCode = ALLOWED_COUNTRIES[Math.floor(rng() * ALLOWED_COUNTRIES.length)];
    const department = ALLOWED_DEPARTMENTS[Math.floor(rng() * ALLOWED_DEPARTMENTS.length)];
    const level = ALLOWED_LEVELS[Math.floor(rng() * ALLOWED_LEVELS.length)];

    const currencyPool = COUNTRY_CURRENCY_AFFINITY[countryCode] || ['USD'];
    const currencyCode = currencyPool[Math.floor(rng() * currencyPool.length)];

    // Salary computation
    const [minSal, maxSal] = BASE_SALARY_RANGES[currencyCode][level];
    const span = maxSal - minSal;
    const offset = BigInt(Math.floor(rng() * Number(span)));
    let salaryMinorUnits = minSal + offset;

    // Inject known intentional outliers (e.g. employee 100, 500, 1000, 2500, 5000)
    if (i === 100 || i === 2500) {
      // Extremely high executive-scale outlier
      salaryMinorUnits = salaryMinorUnits * 4n;
    } else if (i === 500 || i === 5000) {
      // Extremely low intern-scale outlier
      salaryMinorUnits = salaryMinorUnits / 3n;
      if (salaryMinorUnits < 1n) salaryMinorUnits = 1n;
    }

    // Deterministic creation timestamp: offset by (i * 60) seconds from baseTime
    const createdAt = new Date(baseTime + i * 60000).toISOString();

    const employee = {
      id: employeeId,
      employeeCode,
      name,
      email,
      countryCode,
      department,
      level,
      salaryMinorUnits,
      currencyCode,
      createdAt,
      updatedAt: createdAt,
    };

    const history = {
      id: historyId,
      employeeId,
      salaryMinorUnits,
      currencyCode,
      changedAt: createdAt,
    };

    employees.push(employee);
    salaryHistories.push(history);
  }

  return {
    currencies: CURRENCIES,
    employees,
    salaryHistories,
  };
}

