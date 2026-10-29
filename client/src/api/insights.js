import { apiRequest } from './client.js';

export async function fetchPayInsights({ groupBy = 'department', country, department, level } = {}, signal) {
  return apiRequest('/api/pay-insights', {
    params: { groupBy, country, department, level },
    signal,
  });
}

export async function fetchPayOutliers(
  { groupBy = 'department', country, department, level, page = 1, pageSize = 25 } = {},
  signal
) {
  return apiRequest('/api/pay-insights/outliers', {
    params: { groupBy, country, department, level, page, pageSize },
    signal,
  });
}

