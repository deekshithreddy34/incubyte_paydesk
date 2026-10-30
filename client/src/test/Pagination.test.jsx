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

  it('jumps directly to a valid page when clicking Go button', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /page number/i });
    const goButton = screen.getByRole('button', { name: /go/i });

    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.click(goButton);

    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('supports submitting the page number with Enter key', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /page number/i });

    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.submit(input.closest('form'));

    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects numbers exceeding total pages with clear validation error', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onChange={onChange} />); // 5 pages

    const input = screen.getByRole('textbox', { name: /page number/i });
    const goButton = screen.getByRole('button', { name: /go/i });

    fireEvent.change(input, { target: { value: '9' } });
    fireEvent.click(goButton);

    expect(onChange).not.toHaveBeenCalled();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Please enter a page between 1 and 5');
  });

  it('rejects zero, negative numbers, decimals, or non-digits with validation error', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onChange={onChange} />); // 5 pages

    const input = screen.getByRole('textbox', { name: /page number/i });
    const goButton = screen.getByRole('button', { name: /go/i });

    // Test zero
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(goButton);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a page between 1 and 5');

    // Test decimal
    fireEvent.change(input, { target: { value: '2.5' } });
    fireEvent.click(goButton);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a page between 1 and 5');

    // Test non-digit
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(goButton);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a page between 1 and 5');
  });

  it('clears validation error when user begins typing again', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /page number/i });
    const goButton = screen.getByRole('button', { name: /go/i });

    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.click(goButton);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Type again
    fireEvent.change(input, { target: { value: '2' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
