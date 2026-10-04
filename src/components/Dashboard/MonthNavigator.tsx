import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { getMonthLabel } from '../../utils/date';
import { IconButton } from '../ui/Primitives';

interface MonthNavigatorProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onReset?: () => void;
  isCurrent: boolean;
  availableMonths?: Array<{ month: number; year: number }>;
  onSelect?: (month: number, year: number) => void;
  compact?: boolean;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  month,
  year,
  onPrev,
  onNext,
  onReset,
  isCurrent,
  availableMonths = [],
  onSelect,
  compact = false,
}) => {
  const hasHistory = availableMonths.length > 0 || !isCurrent;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
        <IconButton
          icon={ChevronLeft}
          onClick={onPrev}
          size="sm"
          ariaLabel="Previous month"
          iconClassName="w-4 h-4"
        />

        <div className="flex items-center gap-1.5 px-1.5 min-w-[7.5rem] justify-center">
          <CalendarDays className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {onSelect && availableMonths.length > 0 ? (
            <select
              value={`${year}-${month}`}
              onChange={(event) => {
                const [y, m] = event.target.value.split('-').map(Number);
                if (y && m) onSelect(m, y);
              }}
              aria-label="Select month"
              className="bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer text-center"
            >
              {!availableMonths.some((item) => item.month === month && item.year === year) && (
                <option value={`${year}-${month}`}>{getMonthLabel(month, year)}</option>
              )}
              {availableMonths.map((item) => (
                <option key={`${item.year}-${item.month}`} value={`${item.year}-${item.month}`}>
                  {getMonthLabel(item.month, item.year)}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {getMonthLabel(month, year)}
            </span>
          )}
        </div>

        <IconButton
          icon={ChevronRight}
          onClick={onNext}
          size="sm"
          ariaLabel="Next month"
          iconClassName="w-4 h-4"
        />
      </div>

      {hasHistory && onReset && !compact && (
        <button
          onClick={onReset}
          className="px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
        >
          This month
        </button>
      )}
    </div>
  );
};

export default MonthNavigator;
