import { z } from 'zod';
import {
  salaryMinorUnitsSchema,
  countrySchema,
  departmentSchema,
  levelSchema,
  currencySchema,
} from '../../lib/validation.js';

export const createEmployeeSchema = z.object({
  employeeCode: z
    .string({ required_error: 'employeeCode is required' })
    .trim()
    .min(1, 'employeeCode cannot be empty')
    .max(30, 'employeeCode cannot exceed 30 characters'),
  name: z
    .string({ required_error: 'name is required' })
    .trim()
    .min(1, 'name cannot be empty')
    .max(150, 'name cannot exceed 150 characters'),
  email: z
    .string({ required_error: 'email is required' })
    .trim()
    .email('Invalid email address')
    .max(254, 'email cannot exceed 254 characters'),
  countryCode: countrySchema,
  department: departmentSchema,
  level: levelSchema,
  salaryMinorUnits: salaryMinorUnitsSchema,
  currencyCode: currencySchema,
});

export const getEmployeesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  country: countrySchema.optional(),
  department: departmentSchema.optional(),
  level: levelSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

