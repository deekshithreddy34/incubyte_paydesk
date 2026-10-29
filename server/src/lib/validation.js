import { z } from 'zod';
import { ALLOWED_COUNTRIES, ALLOWED_DEPARTMENTS, ALLOWED_LEVELS, ALLOWED_CURRENCY_CODES } from '../config/lookups.js';
import { BadRequestError } from './errors.js';

// Salary Minor Units must be an integer strictly between 1 and Number.MAX_SAFE_INTEGER
export const salaryMinorUnitsSchema = z
  .number({
    required_error: 'salaryMinorUnits is required',
    invalid_type_error: 'salaryMinorUnits must be a number',
  })
  .int('salaryMinorUnits must be an integer')
  .min(1, 'salaryMinorUnits must be at least 1')
  .max(Number.MAX_SAFE_INTEGER, `salaryMinorUnits cannot exceed ${Number.MAX_SAFE_INTEGER}`);

export const uuidParamSchema = z
  .string()
  .uuid('Invalid ID format: must be a valid UUID');

export const countrySchema = z.enum(ALLOWED_COUNTRIES, {
  errorMap: () => ({ message: `Country must be one of: ${ALLOWED_COUNTRIES.join(', ')}` }),
});

export const departmentSchema = z.enum(ALLOWED_DEPARTMENTS, {
  errorMap: () => ({ message: `Department must be one of: ${ALLOWED_DEPARTMENTS.join(', ')}` }),
});

export const levelSchema = z.enum(ALLOWED_LEVELS, {
  errorMap: () => ({ message: `Level must be one of: ${ALLOWED_LEVELS.join(', ')}` }),
});

export const currencySchema = z.enum(ALLOWED_CURRENCY_CODES, {
  errorMap: () => ({ message: `Currency must be one of: ${ALLOWED_CURRENCY_CODES.join(', ')}` }),
});

// Middleware helper to validate request body with strict Zod schema (strips or rejects unknown keys)
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.strict().safeParse(req.body);
    if (!result.success) {
      const fieldErrors = { ...result.error.flatten().fieldErrors };
      for (const issue of result.error.issues) {
        if (issue.code === 'unrecognized_keys' && Array.isArray(issue.keys)) {
          for (const key of issue.keys) {
            fieldErrors[key] = [`Unrecognized field '${key}'`];
          }
        }
      }
      return next(new BadRequestError('Validation failed', fieldErrors));
    }
    req.body = result.data;
    next();
  };
}

// Middleware helper to validate query parameters
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.strict().safeParse(req.query);
    if (!result.success) {
      const fieldErrors = { ...result.error.flatten().fieldErrors };
      for (const issue of result.error.issues) {
        if (issue.code === 'unrecognized_keys' && Array.isArray(issue.keys)) {
          for (const key of issue.keys) {
            fieldErrors[key] = [`Unrecognized parameter '${key}'`];
          }
        }
      }
      return next(new BadRequestError('Invalid query parameters', fieldErrors));
    }
    req.validatedQuery = result.data;
    next();
  };
}

