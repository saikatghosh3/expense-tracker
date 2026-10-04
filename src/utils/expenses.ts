import { CATEGORY_ORDER } from '../constants/categories';
import type { Category, Expense, ExpenseFilters } from '../types';
import { getMonthSortKey, parseISODate } from './date';

export function hasActiveFilters(filters: ExpenseFilters): boolean {
  return (
    filters.category !== 'all' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    Boolean(filters.minAmount) ||
    Boolean(filters.maxAmount) ||
    filters.search.trim().length > 0
  );
}

export function countActiveFilters(filters: ExpenseFilters): number {
  let count = 0;
  if (filters.category !== 'all') count += 1;
  if (filters.startDate) count += 1;
  if (filters.endDate) count += 1;
  if (filters.minAmount) count += 1;
  if (filters.maxAmount) count += 1;
  if (filters.search.trim()) count += 1;
  return count;
}

export function matchesFilters(expense: Expense, filters: ExpenseFilters): boolean {
  if (filters.category !== 'all' && expense.category !== filters.category) return false;
  if (filters.startDate && expense.date < filters.startDate) return false;
  if (filters.endDate && expense.date > filters.endDate) return false;

  if (filters.minAmount) {
    const min = parseFloat(filters.minAmount);
    if (Number.isFinite(min) && expense.amount < min) return false;
  }
  if (filters.maxAmount) {
    const max = parseFloat(filters.maxAmount);
    if (Number.isFinite(max) && expense.amount > max) return false;
  }

  const search = filters.search.trim().toLowerCase();
  if (search) {
    const haystack = `${expense.description} ${expense.merchant ?? ''} ${expense.notes ?? ''} ${expense.category}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  return true;
}

export function sortExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const direction = filters.sortDirection === 'asc' ? 1 : -1;

  return [...expenses].sort((a, b) => {
    switch (filters.sortKey) {
      case 'amount':
        return (a.amount - b.amount) * direction;
      case 'description':
        return a.description.localeCompare(b.description) * direction;
      case 'category':
        return a.category.localeCompare(b.category) * direction;
      case 'date':
      default: {
        // Compare as plain date strings first (identical zero-padded ISO format),
        // then fall back to createdAt so same-day entries keep insertion order.
        if (a.date !== b.date) return (a.date < b.date ? -1 : 1) * direction;
        return (a.createdAt < b.createdAt ? -1 : 1) * direction;
      }
    }
  });
}

export function filterAndSortExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  return sortExpenses(expenses.filter((expense) => matchesFilters(expense, filters)), filters);
}

export interface CategoryTotal {
  name: Category;
  value: number;
  count: number;
}

/** Single-pass aggregation keyed by category. */
export function groupByCategory(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<Category, CategoryTotal>();

  for (const expense of expenses) {
    const entry = totals.get(expense.category);
    if (entry) {
      entry.value += expense.amount;
      entry.count += 1;
    } else {
      totals.set(expense.category, { name: expense.category, value: expense.amount, count: 1 });
    }
  }

  return [...totals.values()].sort((a, b) => b.value - a.value);
}

export interface MonthTotal {
  month: number;
  year: number;
  label: string;
  amount: number;
  count: number;
  /** Locale-independent sort key. */
  sortKey: number;
}

export function groupByMonth(expenses: Expense[]): MonthTotal[] {
  const totals = new Map<string, MonthTotal>();

  for (const expense of expenses) {
    const parsed = parseISODate(expense.date);
    if (!parsed) continue;
    const month = parsed.getMonth() + 1;
    const year = parsed.getFullYear();
    const key = `${year}-${`${month}`.padStart(2, '0')}`;
    const entry = totals.get(key);

    if (entry) {
      entry.amount += expense.amount;
      entry.count += 1;
    } else {
      totals.set(key, {
        month,
        year,
        label: parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: expense.amount,
        count: 1,
        sortKey: getMonthSortKey(month, year),
      });
    }
  }

  return [...totals.values()].sort((a, b) => a.sortKey - b.sortKey);
}

export function getTopCategory(expenses: Expense[]): CategoryTotal | null {
  const grouped = groupByCategory(expenses);
  return grouped.length > 0 ? grouped[0] : null;
}

export function groupByWeekday(expenses: Expense[]): Array<{ day: string; amount: number; count: number }> {
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = order.map((day) => ({ day, amount: 0, count: 0 }));
  const index = new Map(order.map((day, i) => [day, i]));

  for (const expense of expenses) {
    const parsed = parseISODate(expense.date);
    if (!parsed) continue;
    const label = parsed.toLocaleDateString('en-US', { weekday: 'short' });
    const bucket = buckets[index.get(label) ?? 0];
    if (!bucket) continue;
    bucket.amount += expense.amount;
    bucket.count += 1;
  }

  return buckets;
}

export interface DailyTotal {
  date: string;
  label: string;
  amount: number;
}

/** Daily totals with gaps filled, so line charts show a continuous axis. */
export function getDailyTotals(expenses: Expense[]): DailyTotal[] {
  if (expenses.length === 0) return [];

  const amounts = new Map<string, number>();
  let min: Date | null = null;
  let max: Date | null = null;

  for (const expense of expenses) {
    amounts.set(expense.date, (amounts.get(expense.date) ?? 0) + expense.amount);
    const parsed = parseISODate(expense.date);
    if (!parsed) continue;
    if (!min || parsed < min) min = parsed;
    if (!max || parsed > max) max = parsed;
  }

  if (!min || !max) return [];

  const totals: DailyTotal[] = [];
  const cursor = new Date(min);

  while (cursor <= max) {
    const key = `${cursor.getFullYear()}-${`${cursor.getMonth() + 1}`.padStart(2, '0')}-${`${cursor.getDate()}`.padStart(2, '0')}`;
    totals.push({
      date: key,
      label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: amounts.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return totals;
}

/** Running total per day, used for the cumulative spend projection chart. */
export function getCumulativeTotals(expenses: Expense[]): DailyTotal[] {
  let running = 0;
  return getDailyTotals(expenses).map((day) => {
    running += day.amount;
    return { ...day, amount: running };
  });
}

export function getCategoriesInUse(expenses: Expense[]): Category[] {
  return CATEGORY_ORDER.filter((category) => expenses.some((expense) => expense.category === category));
}

export function getAverageExpense(expenses: Expense[]): number {
  return expenses.length === 0 ? 0 : expenses.reduce((t, e) => t + e.amount, 0) / expenses.length;
}

export function getLargestExpense(expenses: Expense[]): Expense | null {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max));
}
