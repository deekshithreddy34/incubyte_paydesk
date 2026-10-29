import React, { useState } from 'react';
import EmployeesPage from './pages/EmployeesPage.jsx';
import { Users, BarChart3, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white font-black text-sm px-2.5 py-1 rounded tracking-wider">
                ACME
              </div>
              <span className="font-bold text-slate-900 text-base">Salary Manager</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('employees')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'employees'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Employees
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'insights'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Pay Insights
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Demo Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-amber-900 font-medium">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Synthetic Assessment Demo: 10,000 reproducible employee records using fixed exchange rates. Not suitable for real confidential salary data.
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'employees' ? (
          <EmployeesPage />
        ) : (
          <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-lg mt-6">
            <BarChart3 className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-base font-semibold text-slate-800">Pay Insights & Outliers</p>
            <p className="text-xs text-slate-500 mt-1">This module will be connected in Plan 10.</p>
          </div>
        )}
      </main>
    </div>
  );
}
