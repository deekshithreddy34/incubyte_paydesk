import { describe, it, expect, vi } from 'vitest';
import { updateSalary, getSalaryHistory } from '../../src/modules/salaries/salary.service.js';
import * as salaryRepo from '../../src/modules/salaries/salary.repository.js';
import { NotFoundError, BadRequestError } from '../../src/lib/errors.js';

describe('Salary Service Unit Tests', () => {
  it('throws BadRequestError when currency is not supported', async () => {
    vi.spyOn(salaryRepo, 'findCurrencyByCode').mockResolvedValue(null);

    await expect(
      updateSalary('00000000-0000-0000-0000-000000000001', {
        salaryMinorUnits: 500000,
        currencyCode: 'XYZ',
      })
    ).rejects.toThrow(BadRequestError);
  });

  it('throws NotFoundError when employee does not exist on update', async () => {
    vi.spyOn(salaryRepo, 'findCurrencyByCode').mockResolvedValue({ code: 'USD' });
    vi.spyOn(salaryRepo, 'updateSalaryWithHistory').mockResolvedValue(null);

    await expect(
      updateSalary('00000000-0000-0000-0000-000000000001', {
        salaryMinorUnits: 500000,
        currencyCode: 'USD',
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when employee does not exist on getHistory', async () => {
    vi.spyOn(salaryRepo, 'findEmployeeById').mockResolvedValue(null);

    await expect(
      getSalaryHistory('00000000-0000-0000-0000-000000000001', { page: 1, pageSize: 25 })
    ).rejects.toThrow(NotFoundError);
  });
});

