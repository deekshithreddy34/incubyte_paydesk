import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEmployees, fetchFilterOptions } from '../api/employees.js';

export function useFilterOptions() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchFilterOptions(controller.signal);
        setData(res);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return { data, isLoading, error };
}

export function useEmployees(filters) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const abortControllerRef = useRef(null);

  const refetch = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    // Abort preceding in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchEmployees(filters, controller.signal)
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

    return () => {
      controller.abort();
    };
  }, [
    filters.search,
    filters.country,
    filters.department,
    filters.level,
    filters.page,
    filters.pageSize,
    version,
  ]);

  return { data, isLoading, error, refetch };
}

