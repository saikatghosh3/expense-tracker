import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_FILTERS, type ExpenseFilters } from '../types';
import { getPresetRange, type DateRangePreset } from '../utils/date';

const STORAGE_KEY = 'expense-tracker-filters';

interface FiltersContextType {
  filters: ExpenseFilters;
  /** Merge a partial update into the current filters. */
  setFilters: (updates: Partial<ExpenseFilters>) => void;
  replaceFilters: (filters: ExpenseFilters) => void;
  resetFilters: () => void;
  applyPreset: (preset: DateRangePreset) => void;
  toggleSortDirection: () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function useFilters(): FiltersContextType {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}

function loadFilters(): ExpenseFilters {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_FILTERS };
    const parsed = JSON.parse(stored) as Partial<ExpenseFilters>;
    return { ...DEFAULT_FILTERS, ...parsed };
  } catch {
    return { ...DEFAULT_FILTERS };
  }
}

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFiltersState] = useState<ExpenseFilters>(loadFilters);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // Non-fatal: filters simply will not survive a reload.
    }
  }, [filters]);

  const setFilters = useCallback((updates: Partial<ExpenseFilters>) => {
    setFiltersState((current) => ({ ...current, ...updates }));
  }, []);

  const replaceFilters = useCallback((next: ExpenseFilters) => {
    setFiltersState(next);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...DEFAULT_FILTERS });
  }, []);

  const applyPreset = useCallback((preset: DateRangePreset) => {
    const { startDate, endDate } = getPresetRange(preset);
    setFiltersState((current) => ({ ...current, startDate, endDate }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setFiltersState((current) => ({
      ...current,
      sortDirection: current.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const value = useMemo<FiltersContextType>(
    () => ({ filters, setFilters, replaceFilters, resetFilters, applyPreset, toggleSortDirection }),
    [filters, setFilters, replaceFilters, resetFilters, applyPreset, toggleSortDirection],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};
