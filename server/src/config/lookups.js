export const COUNTRIES = ['IN', 'US', 'GB', 'JPY_LAND'] // IN, US, GB, JP
export const ALLOWED_COUNTRIES = ['IN', 'US', 'GB', 'JP'];

export const ALLOWED_DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Sales'];

export const ALLOWED_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead'];

export const CURRENCIES = [
  { code: 'USD', decimalPlaces: 2, usdRate: '1.00000000' },
  { code: 'INR', decimalPlaces: 2, usdRate: '0.01200000' },
  { code: 'GBP', decimalPlaces: 2, usdRate: '1.25000000' },
  { code: 'JPY', decimalPlaces: 0, usdRate: '0.00670000' },
];

export const ALLOWED_CURRENCY_CODES = CURRENCIES.map((c) => c.code);

