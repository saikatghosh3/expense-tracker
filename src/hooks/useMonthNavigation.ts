import { useCallback } from 'react';
import { getCurrentMonth, getCurrentYear } from '../utils/date';

interface MonthNavigationApi {
  goToMonth: (delta: number) => void;
  goToMonthSelection: (month: number, year: number) => void;
}

/**
 * Normalises the raw delta-based month helpers into the callbacks the
 * MonthNavigator expects, so every screen navigates months the same way.
 */
export function useMonthNavigation({ goToMonth, goToMonthSelection }: MonthNavigationApi) {
  const onPrevMonth = useCallback(() => goToMonth(-1), [goToMonth]);
  const onNextMonth = useCallback(() => goToMonth(1), [goToMonth]);
  const onResetMonth = useCallback(
    () => goToMonthSelection(getCurrentMonth(), getCurrentYear()),
    [goToMonthSelection],
  );

  return { onPrevMonth, onNextMonth, onResetMonth, onSelectMonth: goToMonthSelection };
}