import { ALLOWED_COUNTRIES, ALLOWED_DEPARTMENTS, ALLOWED_LEVELS } from '../../config/lookups.js';
import * as optionsRepo from './options.repository.js';

const COUNTRY_NAMES = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  JP: 'Japan',
};

export async function getFilterOptions() {
  const currenciesFromDb = await optionsRepo.findCurrencies();

  return {
    countries: ALLOWED_COUNTRIES.map((code) => ({
      code,
      name: COUNTRY_NAMES[code] || code,
    })),
    departments: ALLOWED_DEPARTMENTS,
    levels: ALLOWED_LEVELS,
    currencies: currenciesFromDb.map((c) => ({
      code: c.code,
      decimalPlaces: c.decimalPlaces,
      usdRate: c.usdRate.toString(),
    })),
  };
}

