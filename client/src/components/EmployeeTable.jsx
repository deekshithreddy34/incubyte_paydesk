import React from 'react';
import { formatSalary } from '../lib/money.js';
import { History, DollarSign } from 'lucide-react';

export default function EmployeeTable({
  employees = [],
  currencyMap = {},
  isLoading,
  onChangeSalary,
  onViewHistory,
}) {
  if (isLoading && employees.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-2" />
        <p className="text-sm">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        <p className="text-base font-semibold text-slate-700">No employees found</p>
        <p className="text-xs text-slate-500 mt-1">Try clearing your filters or adding a new employee.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-4 py-3">Code</th>
            <th scope="col" className="px-4 py-3">Employee</th>
            <th scope="col" className="px-4 py-3">Country</th>
            <th scope="col" className="px-4 py-3">Department</th>
            <th scope="col" className="px-4 py-3">Level</th>
            <th scope="col" className="px-4 py-3 text-right">Annual Gross Salary</th>
            <th scope="col" className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {employees.map((emp) => {
            const decPlaces = currencyMap[emp.currencyCode]?.decimalPlaces ?? 2;
            const formatted = formatSalary(emp.salaryMinorUnits, emp.currencyCode, decPlaces);

            return (
              <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                  {emp.employeeCode}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{emp.name}</div>
                  <div className="text-slate-500 text-[11px]">{emp.email}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                    {emp.countryCode}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.department}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      emp.level === 'Lead'
                        ? 'bg-purple-100 text-purple-800'
                        : emp.level === 'Senior'
                        ? 'bg-blue-100 text-blue-800'
                        : emp.level === 'Mid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {emp.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                  {formatted}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => onChangeSalary?.(emp)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                      title="Change annual salary"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Change
                    </button>
                    <button
                      onClick={() => onViewHistory?.(emp)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                      title="View salary change history"
                    >
                      <History className="w-3.5 h-3.5" />
                      History
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

