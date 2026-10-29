import React from 'react';
import { formatSalary } from '../lib/money.js';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function OutliersTable({ outliers = [], groupBy = 'department', isLoading }) {
  if (isLoading && outliers.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="animate-spin inline-block w-6 h-6 border-3 border-current border-t-transparent text-amber-600 rounded-full mb-2" />
        <p className="text-xs">Analyzing 1.5×IQR boundaries in SQL...</p>
      </div>
    );
  }

  if (outliers.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">No outliers detected</p>
        <p className="text-xs text-slate-400 mt-1">
          No salaries fall beyond 1.5×IQR for groups with 4 or more employees.
        </p>
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
            <th scope="col" className="px-4 py-3 capitalize">{groupBy}</th>
            <th scope="col" className="px-4 py-3 text-right">Converted (USD)</th>
            <th scope="col" className="px-4 py-3 text-center">Review Flag</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {outliers.map((row) => (
            <tr key={row.employee.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                {row.employee.employeeCode}
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-900">{row.employee.name}</div>
                <div className="text-slate-500 text-[11px]">{row.employee.email}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{row.group}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                {formatSalary(row.salaryUsdMinorUnits, 'USD', 2)}
              </td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                {row.direction === 'HIGH' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <TrendingUp className="w-3.5 h-3.5" />
                    HIGH
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <TrendingDown className="w-3.5 h-3.5" />
                    LOW
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

