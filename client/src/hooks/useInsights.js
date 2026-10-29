import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPayInsights, fetchPayOutliers } from '../api/insights.js';

export function usePayInsights(params) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const abortControllerRef = useRef(null);

  const refetch = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchPayInsights(params, controller.signal)
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
  }, [params.groupBy, params.country, params.department, params.level, version]);

  return { data, isLoading, error, refetch };
}

export function usePayOutliers(params) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const abortControllerRef = useRef(null);

  const refetch = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchPayOutliers(params, controller.signal)
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
  }, [
    params.groupBy,
    params.country,
    params.department,
    params.level,
    params.page,
    params.pageSize,
    version,
  ]);

  return { data, isLoading, error, refetch };
}

