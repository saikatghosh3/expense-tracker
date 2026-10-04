import React from 'react';
import type { BudgetTier } from '../../types';
import { BUDGET_TIER_STYLES } from '../../constants/budget';

/**
 * Percentage bar with an accessible `progressbar` role.
 *
 * Four separate implementations existed (budget usage, per-category limits,
 * storage usage and the dashboard snapshot) that only differed by height and
 * colour, so height, tone and fill style are parameters here.
 *
 * Bar colours reuse `BUDGET_TIER_STYLES` so a bar can never drift from the
 * surface colours of the tier it represents.
 */

export type ProgressTone = BudgetTier;

const SIZES = {
  xs: 'h-2',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3',
} as const;

const TONES: Record<BudgetTier, { gradient: string; solid: string }> = {
  healthy: {
    gradient: `bg-gradient-to-r ${BUDGET_TIER_STYLES.healthy.gradient}`,
    solid: 'bg-emerald-500',
  },
  warning: {
    gradient: `bg-gradient-to-r ${BUDGET_TIER_STYLES.warning.gradient}`,
    solid: 'bg-amber-500',
  },
  critical: {
    gradient: `bg-gradient-to-r ${BUDGET_TIER_STYLES.critical.gradient}`,
    solid: 'bg-rose-500',
  },
};

export interface ProgressBarProps {
  /** 0-100. Values above 100 are clamped so the bar cannot overflow. */
  value: number;
  tone?: ProgressTone;
  size?: keyof typeof SIZES;
  filled?: 'gradient' | 'solid';
  /** Accessible name. Providing one makes the bar announce as a progressbar. */
  label?: string;
  /** Keeps a sliver visible for very small but non-zero values. */
  minPercent?: number;
  duration?: string;
  trackClassName?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  tone = 'healthy',
  size = 'md',
  filled = 'gradient',
  label,
  minPercent = 0,
  duration = 'duration-700',
  trackClassName = 'bg-slate-100 dark:bg-slate-800',
  className = '',
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const width = `${Math.max(clamped, minPercent)}%`;

  return (
    <div
      className={`w-full ${SIZES[size]} ${trackClassName} rounded-full overflow-hidden ${className}`}
      role={label ? 'progressbar' : undefined}
      aria-valuenow={label ? Math.round(clamped) : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full transition-all ${duration} ease-out ${
          TONES[tone][filled]
        }`}
        style={{ width }}
      />
    </div>
  );
};

export default ProgressBar;