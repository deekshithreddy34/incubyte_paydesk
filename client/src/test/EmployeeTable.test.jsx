import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EmployeeTable from '../components/EmployeeTable.jsx';

describe('EmployeeTable Component', () => {
  const mockCurrencyMap = {
    USD: { code: 'USD', decimalPlaces: 2, usdRate: 1 },
    JPY: { code: 'JPY', decimalPlaces: 0, usdRate: 0.0067 },
  };

  const sampleEmployees = [
    {
      id: 'emp-1',
      employeeCode: 'EMP-001',
      name: 'Alice Johnson',
      email: 'alice@acme.corp',
      countryCode: 'US',
      department: 'Engineering',
      level: 'Senior',
      currencyCode: 'USD',
      salaryMinorUnits: 12000000,
    },
    {
      id: 'emp-2',
      employeeCode: 'EMP-EXTRAORDINARILY-LONG-CODE-2026-X999',
      name: 'Dr. Christopher Bartholomew Montgomery The Third',
      email: 'christopher.bartholomew.montgomery.the.third@longdomain.engineering.acme.corp',
      countryCode: 'JP',
      department: 'Human Resources',
      level: 'Lead',
      currencyCode: 'JPY',
      salaryMinorUnits: 15000000,
    },
  ];

  it('renders loading state when isLoading is true and no employees loaded', () => {
    render(<EmployeeTable isLoading={true} employees={[]} />);
    expect(screen.getByText('Loading employees...')).toBeInTheDocument();
  });

  it('renders empty state when employees list is empty', () => {
    render(<EmployeeTable isLoading={false} employees={[]} />);
    expect(screen.getByText('No employees found')).toBeInTheDocument();
  });

  it('renders table headers and employee records correctly', () => {
    render(
      <EmployeeTable
        employees={sampleEmployees}
        currencyMap={mockCurrencyMap}
        isLoading={false}
      />
    );

    // Headers
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Annual Gross Salary')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Standard employee row
    expect(screen.getByText('EMP-001')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('alice@acme.corp')).toBeInTheDocument();
    expect(screen.getByText('120,000.00 USD')).toBeInTheDocument();
  });

  it('wraps long employee codes, names, and emails gracefully without clipping', () => {
    render(
      <EmployeeTable
        employees={sampleEmployees}
        currencyMap={mockCurrencyMap}
        isLoading={false}
      />
    );

    const longCodeCell = screen.getByText('EMP-EXTRAORDINARILY-LONG-CODE-2026-X999');
    expect(longCodeCell).toBeInTheDocument();
    expect(longCodeCell).toHaveClass('break-all');

    const longNameEl = screen.getByText('Dr. Christopher Bartholomew Montgomery The Third');
    expect(longNameEl).toBeInTheDocument();
    expect(longNameEl).toHaveClass('break-words');

    const longEmailEl = screen.getByText(
      'christopher.bartholomew.montgomery.the.third@longdomain.engineering.acme.corp'
    );
    expect(longEmailEl).toBeInTheDocument();
    expect(longEmailEl).toHaveClass('break-all');
  });

  it('triggers onChangeSalary and onViewHistory callbacks when action buttons are clicked', () => {
    const onChangeSalary = vi.fn();
    const onViewHistory = vi.fn();

    render(
      <EmployeeTable
        employees={sampleEmployees}
        currencyMap={mockCurrencyMap}
        isLoading={false}
        onChangeSalary={onChangeSalary}
        onViewHistory={onViewHistory}
      />
    );

    const changeButtons = screen.getAllByRole('button', { name: /change/i });
    const historyButtons = screen.getAllByRole('button', { name: /history/i });

    fireEvent.click(changeButtons[0]);
    expect(onChangeSalary).toHaveBeenCalledWith(sampleEmployees[0]);

    fireEvent.click(historyButtons[0]);
    expect(onViewHistory).toHaveBeenCalledWith(sampleEmployees[0]);
  });
});
