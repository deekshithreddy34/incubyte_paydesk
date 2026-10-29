import { describe, it, expect } from 'vitest';
import { getInsightsQuerySchema, getOutliersQuerySchema } from '../../src/modules/insights/insight.schemas.js';

describe('Insight Validation Unit Tests', () => {
  it('defaults groupBy to department when omitted', () => {
    const res = getInsightsQuerySchema.safeParse({});
    expect(res.success).toBe(true);
    expect(res.data.groupBy).toBe('department');
  });

  it('accepts valid groupBy dimensions: country, department, level', () => {
    for (const dimension of ['country', 'department', 'level']) {
      const res = getInsightsQuerySchema.safeParse({ groupBy: dimension });
      expect(res.success).toBe(true);
      expect(res.data.groupBy).toBe(dimension);
    }
  });

  it('rejects invalid groupBy values with validation error', () => {
    const res = getInsightsQuerySchema.safeParse({ groupBy: 'invalid_dim' });
    expect(res.success).toBe(false);
  });

  it('validates outlier pagination bounds', () => {
    const resNegativePage = getOutliersQuerySchema.safeParse({ page: 0 });
    expect(resNegativePage.success).toBe(false);

    const resPageSizeTooLarge = getOutliersQuerySchema.safeParse({ pageSize: 101 });
    expect(resPageSizeTooLarge.success).toBe(false);

    const resValid = getOutliersQuerySchema.safeParse({ page: 2, pageSize: 50 });
    expect(resValid.success).toBe(true);
    expect(resValid.data.page).toBe(2);
    expect(resValid.data.pageSize).toBe(50);
  });
});

