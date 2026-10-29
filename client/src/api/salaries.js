import { apiRequest } from './client.js';

export async function updateEmployeeSalary(employeeId, { salaryMinorUnits, currencyCode }) {
  return apiRequest(`/api/employees/${employeeId}/salary`, {
    method: 'PATCH',
    body: { salaryMinorUnits, currencyCode },
  });
}

export async function fetchSalaryHistory(employeeId, { page = 1, pageSize = 25 } = {}, signal) {
  return apiRequest(`/api/employees/${employeeId}/salary-history`, {
    params: { page, pageSize },
    signal,
  });
}

