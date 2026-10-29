import React, { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function EmployeeFilters({
  filters,
  onChange,
  onReset,
  options,
  isLoading,
}) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChange('search', localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, filters.search, onChange]);

  const countries = options?.data?.countries || [];
  const departments = options?.data?.departments || [];
  const levels = options?.data?.levels || [];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="relative">
          <label htmlFor="search-input" className="block text-xs font-semibold text-slate-600 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Name, email, code..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Country Filter */}
        <div>
          <label htmlFor="country-select" className="block text-xs font-semibold text-slate-600 mb-1">
            Country
          </label>
          <select
            id="country-select"
            value={filters.country || ''}
            onChange={(e) => onChange('country', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label htmlFor="dept-select" className="block text-xs font-semibold text-slate-600 mb-1">
            Department
          </label>
          <select
            id="dept-select"
            value={filters.department || ''}
            onChange={(e) => onChange('department', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label htmlFor="level-select" className="block text-xs font-semibold text-slate-600 mb-1">
            Level
          </label>
          <select
            id="level-select"
            value={filters.level || ''}
            onChange={(e) => onChange('level', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters bar */}
      {(filters.search || filters.country || filters.department || filters.level) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              setLocalSearch('');
              onReset();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

