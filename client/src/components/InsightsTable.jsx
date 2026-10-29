import React from 'react';
import { formatSalary } from '../lib/money.js';

export default function InsightsTable({ summaries = [], groupBy = 'department', isLoading }) {
  if (isLoading && summaries.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="animate-spin inline-block w-6 h-6 border-3 border-current border-t-transparent text-blue-600 rounded-full mb-2" />
        <p className="text-xs">Computing group aggregates in SQL...</p>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">No data available</p>
        <p className="text-xs text-slate-400 mt-1">Try relaxing or clearing your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-4 py-3 capitalize">{groupBy}</th>
            <th scope="col" className="px-4 py-3 text-right">Headcount</th>
            <th scope="col" className="px-4 py-3 text-right">Average (USD)</th>
            <th scope="col" className="px-4 py-3 text-right">Minimum (USD)</th>
            <th scope="col" className="px-4 py-3 text-right">Maximum (USD)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {summaries.map((s) => (
            <tr key={s.group} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900">{s.group}</td>
              <td className="px-4 py-3 text-right font-mono">{s.employeeCount.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-mono font-medium text-blue-700">
                {formatSalary(s.averageSalaryUsdMinorUnits, 'USD', 2)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-600">
                {formatSalary(s.minSalaryUsdMinorUnits, 'USD', 2)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-600">
                {formatSalary(s.maxSalaryUsdMinorUnits, 'USD', 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

