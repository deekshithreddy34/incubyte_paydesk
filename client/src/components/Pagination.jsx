import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageSize, total, onChange, itemLabel = 'employees' }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const [inputPage, setInputPage] = useState('');
  const [error, setError] = useState('');

  const handleGo = (e) => {
    e.preventDefault();
    const trimmed = inputPage.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setError(`Please enter a page between 1 and ${totalPages}`);
      return;
    }

    const target = Number(trimmed);
    if (target < 1 || target > totalPages) {
      setError(`Please enter a page between 1 and ${totalPages}`);
      return;
    }

    setError('');
    onChange(target);
    setInputPage('');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 sm:px-6">
      <div className="text-xs text-slate-600">
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> {itemLabel}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Previous
          </button>

          <span className="text-xs text-slate-600 px-2">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </button>
        </div>

        <form onSubmit={handleGo} className="flex items-center gap-1.5">
          <label htmlFor="go-to-page-input" className="text-xs text-slate-600 font-medium">
            Go to page:
          </label>
          <input
            id="go-to-page-input"
            type="text"
            inputMode="numeric"
            value={inputPage}
            onChange={(e) => {
              setInputPage(e.target.value);
              if (error) setError('');
            }}
            placeholder={String(page)}
            aria-label="Page number"
            className={`w-14 px-2 py-1 text-xs border rounded-md text-center focus:outline-none focus:ring-1 ${
              error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-indigo-500'
            }`}
          />
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            Go
          </button>
          {error && (
            <span role="alert" className="text-xs text-rose-600 font-medium ml-1">
              {error}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
