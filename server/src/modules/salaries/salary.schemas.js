import { z } from 'zod';
import { salaryMinorUnitsSchema, currencySchema, uuidParamSchema } from '../../lib/validation.js';

export const updateSalarySchema = z.object({
  salaryMinorUnits: salaryMinorUnitsSchema,
  currencyCode: currencySchema,
});

export const employeeIdParamSchema = z.object({
  id: uuidParamSchema,
});

export const getSalaryHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

