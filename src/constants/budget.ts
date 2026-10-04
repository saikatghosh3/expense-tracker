/** Spending at or below this percentage of budget is considered healthy. */
export const BUDGET_TIER_HEALTHY_PCT = 60;

/** Above the healthy threshold but at or below this percentage is a warning. */
export const BUDGET_TIER_WARNING_PCT = 85;

export const BUDGET_TIER_STYLES = {
  healthy: {
    gradient: 'from-emerald-500 to-green-500',
    text: 'text-emerald-600',
    surface: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
    label: 'On track',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    text: 'text-amber-600',
    surface: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
    label: 'Approaching limit',
  },
  critical: {
    gradient: 'from-red-500 to-rose-500',
    text: 'text-red-600',
    surface: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30',
    label: 'Over budget',
  },
} as const;
