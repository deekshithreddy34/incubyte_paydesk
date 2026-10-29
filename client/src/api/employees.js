import { apiRequest } from './client.js';

export async function fetchEmployees({ search, country, department, level, page, pageSize }, signal) {
  return apiRequest('/api/employees', {
    params: { search, country, department, level, page, pageSize },
    signal,
  });
}

export async function createEmployee(employeeData) {
  return apiRequest('/api/employees', {
    method: 'POST',
    body: employeeData,
  });
}

export async function fetchFilterOptions(signal) {
  return apiRequest('/api/filter-options', { signal });
}

