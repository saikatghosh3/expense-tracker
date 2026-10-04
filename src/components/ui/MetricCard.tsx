import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { CARD_BASE } from './Card';

/**
 * The single implementation behind every "icon + label + value" figure in the
 * app. Four separate tiles existed (dashboard KPIs, analytics/admin counters,
 * budget summary tiles and profile sidebar metrics) that differed only by size
 * and layout, so the differences are now `variant`s.
 */

export type MetricCardVariant =
  /** Large dashboard KPI with an optional period-over-period delta chip. */
  | 'kpi'
  /** Compact counter inside a card: icon left, uppercase label, value. */
  | 'counter'
  /** Centre-aligned tile on a tinted surface, used by budget summaries. */
  | 'highlight'
  /** Icon + label + value with no card surface, for side panels. */
  | 'row';

export interface MetricCardProps {
  variant?: MetricCardVariant;
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  /** Tailwind gradient pair applied to the icon badge. */
  gradient?: string;
  /** Value text colour for the `highlight` variant. */
  valueClassName?: string;
  /** Full container classes for the `highlight` variant's tinted surface. */
  surfaceClassName?: string;
  /** Value size for the `counter` variant. */
  valueSize?: 'lg' | 'xl';
  /** Supporting line under the value (`kpi` only). */
  footer?: string;
  footerTone?: 'positive' | 'negative' | 'neutral';
  /** Period-over-period change text, e.g. "+12%" (`kpi` only). */
  delta?: string;
  /** Whether the change is good. Spending going up is not necessarily good. */
  deltaFavourable?: boolean;
  className?: string;
}

const FOOTER_COLORS = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-slate-500 dark:text-slate-400',
} as const;

const MetricCard: React.FC<MetricCardProps> = ({
  variant = 'counter',
  label,
  value,
  icon: Icon,
  gradient = 'from-indigo-500 to-violet-600',
  valueClassName = '',
  surfaceClassName = '',
  valueSize = 'lg',
  footer,
  footerTone = 'neutral',
  delta,
  deltaFavourable,
  className = '',
}) => {
  if (variant === 'highlight') {
    return (
      <div className={`rounded-xl border p-4 text-center ${surfaceClassName} ${className}`}>
        <div
          className={`mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>

        <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">{label}</p>

        <p className={`text-lg font-bold sm:text-xl ${valueClassName}`}>{value}</p>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div
          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums break-words">
            {value}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'kpi') {
    return (
      <div
        className={`${CARD_BASE} p-5 flex flex-col gap-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-all duration-300 group ${className}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          {delta && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${
                deltaFavourable === undefined
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  : deltaFavourable
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}
              title="Compared with last month"
            >
              {deltaFavourable === false ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : deltaFavourable === true ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {delta}
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight break-words">
            {value}
          </p>
          {footer && (
            <p className={`text-xs font-medium mt-1.5 ${FOOTER_COLORS[footerTone]}`}>{footer}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_BASE} ${className}`}>
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p
            className={`font-bold text-slate-900 dark:text-slate-100 break-words ${
              valueSize === 'xl' ? 'text-xl' : 'text-lg'
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;