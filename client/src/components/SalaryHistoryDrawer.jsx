import React, { useState } from 'react';
import { X, History, Clock } from 'lucide-react';
import { useSalaryHistory } from '../hooks/useSalaryHistory.js';
import { formatSalary } from '../lib/money.js';
import Pagination from './Pagination.jsx';

export default function SalaryHistoryDrawer({
  isOpen,
  onClose,
  employee,
  currencies = [],
}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useSalaryHistory(employee?.id, page, pageSize);

  if (!isOpen || !employee) return null;

  const currencyMap = currencies.reduce((acc, c) => {
    acc[c.code] = c;
    return acc;
  }, {});

  const historyRecords = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <div>
              <h2 id="drawer-title" className="text-base font-bold text-slate-900">
                Salary Audit History
              </h2>
              <p className="text-xs text-slate-500">
                {employee.name} ({employee.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading && (
            <div className="py-12 text-center text-slate-500 text-xs">
              Loading history records...
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              Failed to load history: {error.message}
            </div>
          )}

          {!isLoading && !error && historyRecords.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No history entries found.
            </div>
          )}

          {!isLoading && historyRecords.length > 0 && (
            <div className="space-y-3">
              {historyRecords.map((item, index) => {
                const decPlaces = currencyMap[item.currencyCode]?.decimalPlaces ?? 2;
                const formatted = formatSalary(item.salaryMinorUnits, item.currencyCode, decPlaces);
                const isInitial = index === historyRecords.length - 1 && page === Math.ceil(total / pageSize);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {formatted}
                      </span>
                      {isInitial ? (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Initial
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          Update
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.changedAt).toLocaleString()} (UTC)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="border-t border-slate-200">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

