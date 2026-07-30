'use client';

import { useCallback, useEffect, useState } from 'react';
import dashboardService from '@/services/dashboardService';
import type { DashboardFilters, DashboardSummary } from '@/lib/dashboard/dashboard-types';

export const useDashboardSummary = (filters: DashboardFilters) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'load' | 'refresh' = 'load') => {
    if (mode === 'refresh') setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const nextSummary = await dashboardService.getSummary(filters);
      setSummary(nextSummary);
      setError(null);
    } catch {
      setError('Dashboard summary could not be loaded. Check your connection and retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    void load('load');
  }, [load]);

  return {
    summary,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load('refresh'),
  };
};
