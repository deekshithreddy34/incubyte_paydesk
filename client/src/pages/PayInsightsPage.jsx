import React, { useState } from 'react';
import { useFilterOptions } from '../hooks/useEmployees.js';
import { usePayInsights, usePayOutliers } from '../hooks/useInsights.js';
import InsightsTable from '../components/InsightsTable.jsx';
import OutliersTable from '../components/OutliersTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { Info, HelpCircle, AlertTriangle, RotateCcw } from 'lucide-react';

export default function PayInsightsPage() {
  const [filters, setFilters] = useState({
    groupBy: 'department',
    country: '',
    department: '',
    level: '',
    page: 1,
    pageSize: 25,
  });

  const { data: optionsData, isLoading: isLoadingOptions } = useFilterOptions();
  const { data: insightsData, isLoading: isLoadingInsights, error: insightsError, refetch: refetchInsights } =
    usePayInsights(filters);
  const { data: outliersData, isLoading: isLoadingOutliers, error: outliersError, refetch: refetchOutliers } =
    usePayOutliers(filters);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset outlier pagination on any group/filter change
    }));
  }

  function handleResetFilters() {
    setFilters({
      groupBy: 'department',
      country: '',
      department: '',
      level: '',
      page: 1,
      pageSize: 25,
    });
  }

  const countries = optionsData?.data?.countries || [];
  const departments = optionsData?.data?.departments || [];
  const levels = optionsData?.data?.levels || [];

  return (
    <div className="py-6 space-y-8">
      {/* Title & Filter Bar */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 m-0">Pay Distribution Insights</h1>
        <p className="text-xs text-slate-500 mt-1">
          Compare compensation across countries, departments, and levels converted to USD.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="group-select" className="block text-xs font-semibold text-slate-700 mb-1">
              Group By Dimension *
            </label>
            <select
              id="group-select"
              value={filters.groupBy}
              onChange={(e) => handleFilterChange('groupBy', e.target.value)}
              disabled={isLoadingOptions}
              className="w-full px-3 py-2 text-sm font-medium border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-blue-50/30 text-blue-900"
            >
              <option value="department">Department</option>
              <option value="country">Country</option>
              <option value="level">Level</option>
            </select>
          </div>

          <div>
            <label htmlFor="ins-country" className="block text-xs font-semibold text-slate-700 mb-1">
              Country Filter
            </label>
            <select
              id="ins-country"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ins-dept" className="block text-xs font-semibold text-slate-700 mb-1">
              Department Filter
            </label>
            <select
              id="ins-dept"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ins-level" className="block text-xs font-semibold text-slate-700 mb-1">
              Level Filter
            </label>
            <select
              id="ins-level"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
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

        {(filters.country || filters.department || filters.level || filters.groupBy !== 'department') && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Mandatory Fixed Rate & Methodology Disclaimer Banner */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Conversion & Aggregation Policy</span>
        </div>
        <p className="text-blue-800">
          All group aggregates and comparisons are calculated over <strong>current annual gross salaries</strong> using fixed illustrative demo exchange rates (USD 1.0, INR 0.012, GBP 1.25, JPY 0.0067). They do not represent real-time market foreign exchange rates.
        </p>
      </div>

      {/* Section 1: Summary Aggregates */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900 m-0">Group Compensation Summary</h2>
          <span className="text-xs text-slate-500 font-mono">Currency: USD</span>
        </div>

        {insightsError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex justify-between items-center">
            <span>Failed to load summary: {insightsError.message}</span>
            <button onClick={() => refetchInsights()} className="font-semibold underline">Retry</button>
          </div>
        )}

        <InsightsTable
          summaries={insightsData?.data || []}
          groupBy={filters.groupBy}
          isLoading={isLoadingInsights}
        />
      </section>

      {/* Section 2: Outliers Analysis */}
      <section className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 m-0">Salary Outliers (IQR Review Flags)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified using 1.5×IQR boundary rule (linear-interpolated percentiles). Groups smaller than 4 produce no outliers.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Flags invite HR review, not proof of unfairness</span>
          </div>
        </div>

        {outliersError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex justify-between items-center">
            <span>Failed to load outliers: {outliersError.message}</span>
            <button onClick={() => refetchOutliers()} className="font-semibold underline">Retry</button>
          </div>
        )}

        <OutliersTable
          outliers={outliersData?.data || []}
          groupBy={filters.groupBy}
          isLoading={isLoadingOutliers}
        />

        {outliersData && outliersData.total > 0 && (
          <Pagination
            page={filters.page}
            pageSize={filters.pageSize}
            total={outliersData.total}
            onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          />
        )}
      </section>
    </div>
  );
}

