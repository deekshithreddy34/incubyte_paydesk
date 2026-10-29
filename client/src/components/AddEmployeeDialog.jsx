import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { parseSalaryInput } from '../lib/money.js';

export default function AddEmployeeDialog({
  isOpen,
  onClose,
  onSubmit,
  options,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    email: '',
    countryCode: 'US',
    department: 'Engineering',
    level: 'Junior',
    salaryText: '',
    currencyCode: 'USD',
  });

  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const countries = options?.data?.countries || [];
  const departments = options?.data?.departments || [];
  const levels = options?.data?.levels || [];
  const currencies = options?.data?.currencies || [];

  const selectedCurrency = currencies.find((c) => c.code === formData.currencyCode);
  const decimalPlaces = selectedCurrency?.decimalPlaces ?? 2;

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear specific field error when edited
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    let salaryMinorUnits;
    try {
      salaryMinorUnits = parseSalaryInput(formData.salaryText, decimalPlaces);
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, salaryText: err.message }));
      return;
    }

    try {
      await onSubmit({
        employeeCode: formData.employeeCode,
        name: formData.name,
        email: formData.email,
        countryCode: formData.countryCode,
        department: formData.department,
        level: formData.level,
        salaryMinorUnits,
        currencyCode: formData.currencyCode,
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to create employee');
      if (err.fields) {
        setFieldErrors(err.fields);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 id="dialog-title" className="text-base font-bold text-slate-900">
            Add New Employee
          </h2>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="code-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Code *
              </label>
              <input
                id="code-input"
                type="text"
                placeholder="ACME-10001"
                value={formData.employeeCode}
                onChange={(e) => handleChange('employeeCode', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
              />
              {fieldErrors.employeeCode && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.employeeCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="country-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Country *
              </label>
              <select
                id="country-input"
                value={formData.countryCode}
                onChange={(e) => handleChange('countryCode', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              id="name-input"
              type="text"
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.name && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email *
            </label>
            <input
              id="email-input"
              type="email"
              placeholder="jane.doe@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 lowercase"
            />
            {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dept-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                id="dept-input"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Level *
              </label>
              <select
                id="level-input"
                value={formData.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="col-span-2">
              <label htmlFor="salary-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Gross Salary *
              </label>
              <input
                id="salary-input"
                type="text"
                placeholder={decimalPlaces === 0 ? '5000000' : '85000.00'}
                value={formData.salaryText}
                onChange={(e) => handleChange('salaryText', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.salaryText && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.salaryText}</p>
              )}
            </div>

            <div>
              <label htmlFor="curr-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Currency *
              </label>
              <select
                id="curr-input"
                value={formData.currencyCode}
                onChange={(e) => handleChange('currencyCode', e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code}
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
              {isLoading ? 'Saving...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

