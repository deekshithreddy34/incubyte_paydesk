import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Pagination from '../components/Pagination.jsx';

describe('Pagination Component', () => {
  it('renders correct page information and totals', () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={55} onChange={onChange} />);

    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 6')).toBeInTheDocument();
  });

  it('disables Previous on page 1 and calls onChange on Next', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={25} onChange={onChange} />);

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    const nextButton = screen.getByRole('button', { name: /next page/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables Next on last page', () => {
    const onChange = vi.fn();
    render(<Pagination page={3} pageSize={10} total={25} onChange={onChange} />);

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).toBeDisabled();
  });
});
