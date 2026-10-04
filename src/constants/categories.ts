import { CATEGORIES, type Category } from '../types';

export const CATEGORY_ICONS: Record<Category, string> = {
  'Food & Dining': '🍽️',
  Transportation: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  'Bills & Utilities': '⚡',
  Healthcare: '🏥',
  Travel: '✈️',
  Education: '📚',
  Other: '📦',
};

/** Tailwind classes for the category pill in lists. */
export const CATEGORY_BADGES: Record<Category, string> = {
  'Food & Dining': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  Transportation: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  Shopping: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  Entertainment: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30',
  'Bills & Utilities': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
  Healthcare: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  Travel: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  Education: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30',
  Other: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30',
};

/** Hex values for chart series. Kept in sync with CATEGORY_BADGES hue families. */
export const CATEGORY_COLORS: Record<Category, string> = {
  'Food & Dining': '#ef4444',
  Transportation: '#3b82f6',
  Shopping: '#8b5cf6',
  Entertainment: '#ec4899',
  'Bills & Utilities': '#f97316',
  Healthcare: '#10b981',
  Travel: '#6366f1',
  Education: '#eab308',
  Other: '#64748b',
};

/** Neutral accent colours for non-category chart series. */
export const CHART_COLORS = {
  primary: '#6366f1',
  positive: '#10b981',
  negative: '#f43f5e',
  budget: '#f59e0b',
  muted: '#94a3b8',
} as const;

const FALLBACK_BADGE = CATEGORY_BADGES.Other;

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category as Category] ?? CATEGORY_ICONS.Other;
}

export function getCategoryBadge(category: string): string {
  return CATEGORY_BADGES[category as Category] ?? FALLBACK_BADGE;
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category as Category] ?? CATEGORY_COLORS.Other;
}

/** Stable palette order so a category keeps the same colour in every chart. */
export const CATEGORY_ORDER: readonly Category[] = CATEGORIES;
