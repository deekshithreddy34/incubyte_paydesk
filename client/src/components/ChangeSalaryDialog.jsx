import React, { useState } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { parseSalaryInput, formatSalary } from '../lib/money.js';

export default function ChangeSalaryDialog({
  isOpen,
  onClose,
  employee,
  currencies = [],
  onSubmit,
  isLoading,
}) {
  const [newSalaryText, setNewSalaryText] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(employee?.currencyCode || 'USD');
  const [formError, setFormError] = useState('');

  if (!isOpen || !employee) return null;

  const currentCurrencyMeta = currencies.find((c) => c.code === employee.currencyCode);
  const targetCurrencyMeta = currencies.find((c) => c.code === selectedCurrency);
  const decimalPlaces = targetCurrencyMeta?.decimalPlaces ?? 2;

  const currentFormatted = formatSalary(
    employee.salaryMinorUnits,
    employee.currencyCode,
    currentCurrencyMeta?.decimalPlaces ?? 2
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    let salaryMinorUnits;
    try {
      salaryMinorUnits = parseSalaryInput(newSalaryText, decimalPlaces);
    } catch (err) {
      setFormError(err.message);
      return;
    }

    try {
      await onSubmit(employee.id, {
        salaryMinorUnits,
        currencyCode: selectedCurrency,
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to update salary');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-salary-title"
        className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 id="change-salary-title" className="text-base font-bold text-slate-900">
              Change Salary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.name} ({employee.employeeCode})
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Current Salary Box */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Current Annual Gross Salary
            </span>
            <span className="font-mono text-base font-bold text-slate-900">
              {currentFormatted}
            </span>
          </div>

          {/* Immediate effect disclaimer */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-xs text-blue-800">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
            <span>
              Salary changes take effect immediately and are permanently appended to the employee's audit history.
            </span>
          </div>

          {/* Inputs for New Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="new-salary-input" className="block text-xs font-semibold text-slate-700 mb-1">
                New Annual Gross Salary *
              </label>
              <input
                id="new-salary-input"
                type="text"
                placeholder={decimalPlaces === 0 ? '6000000' : '95000.00'}
                value={newSalaryText}
                onChange={(e) => setNewSalaryText(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="change-curr-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Currency *
              </label>
              <select
                id="change-curr-select"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? 'Updating...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

