import React, { useState } from 'react';
import { useEmployees, useFilterOptions } from '../hooks/useEmployees.js';
import { createEmployee } from '../api/employees.js';
import EmployeeFilters from '../components/EmployeeFilters.jsx';
import EmployeeTable from '../components/EmployeeTable.jsx';
import Pagination from '../components/Pagination.jsx';
import AddEmployeeDialog from '../components/AddEmployeeDialog.jsx';
import { UserPlus, AlertTriangle } from 'lucide-react';

export default function EmployeesPage() {
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    department: '',
    level: '',
    page: 1,
    pageSize: 25,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: optionsData, isLoading: isLoadingOptions } = useFilterOptions();
  const { data: employeeData, isLoading: isLoadingEmployees, error, refetch } = useEmployees(filters);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 whenever any filter changes
    }));
  }

  function handleResetFilters() {
    setFilters((prev) => ({
      ...prev,
      search: '',
      country: '',
      department: '',
      level: '',
      page: 1,
    }));
  }

  async function handleAddEmployee(newEmployeeData) {
    setIsSubmitting(true);
    try {
      await createEmployee(newEmployeeData);
      refetch(); // Refresh list cleanly
    } finally {
      setIsSubmitting(false);
    }
  }

  const currencies = optionsData?.data?.currencies || [];
  const currencyMap = currencies.reduce((acc, curr) => {
    acc[curr.code] = curr;
    return acc;
  }, {});

  return (
    <div className="py-6 space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain salary records and filter across {employeeData?.total?.toLocaleString() ?? '10,000'} employees.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Filter Toolbar */}
      <EmployeeFilters
        filters={filters}
        options={optionsData}
        isLoading={isLoadingOptions}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error / Retry display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span>Failed to load employees: {error.message}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table */}
      <EmployeeTable
        employees={employeeData?.data || []}
        currencyMap={currencyMap}
        isLoading={isLoadingEmployees}
        onChangeSalary={(emp) => alert(`Salary update for ${emp.employeeCode} (wired in Plan 10)`)}
        onViewHistory={(emp) => alert(`Salary history for ${emp.employeeCode} (wired in Plan 10)`)}
      />

      {/* Pagination Footer */}
      {employeeData && employeeData.total > 0 && (
        <Pagination
          page={filters.page}
          pageSize={filters.pageSize}
          total={employeeData.total}
          onChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
        />
      )}

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        options={optionsData}
        isLoading={isSubmitting}
        onSubmit={handleAddEmployee}
      />
    </div>
  );
}

