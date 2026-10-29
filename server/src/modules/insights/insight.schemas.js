import { z } from 'zod';
import { countrySchema, departmentSchema, levelSchema } from '../../lib/validation.js';

export const groupBySchema = z.enum(['country', 'department', 'level']).default('department');

export const getInsightsQuerySchema = z.object({
  groupBy: groupBySchema,
  country: countrySchema.optional(),
  department: departmentSchema.optional(),
  level: levelSchema.optional(),
});

export const getOutliersQuerySchema = z.object({
  groupBy: groupBySchema,
  country: countrySchema.optional(),
  department: departmentSchema.optional(),
  level: levelSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

