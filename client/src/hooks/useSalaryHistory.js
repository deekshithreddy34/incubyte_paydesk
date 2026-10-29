import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSalaryHistory } from '../api/salaries.js';

export function useSalaryHistory(employeeId, page = 1, pageSize = 25) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const abortControllerRef = useRef(null);

  const refetch = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!employeeId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchSalaryHistory(employeeId, { page, pageSize }, controller.signal)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [employeeId, page, pageSize, version]);

  return { data, isLoading, error, refetch };
}

