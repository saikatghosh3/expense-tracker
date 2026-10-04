/** Calendar date helpers. All expense dates are stored as `YYYY-MM-DD` strings. */

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function isDateInMonth(dateValue: string, month: number, year: number): boolean {
  return dateValue.startsWith(`${year}-${`${month}`.padStart(2, '0')}`);
}

export function getMonthLabel(month: number, year: number, locale = 'en-US'): string {
  return new Date(year, month - 1, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function getShortMonthLabel(month: number, year: number, locale = 'en-US'): string {
  return new Date(year, month - 1, 1).toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

/**
 * Locale-independent sort key for a month/year pair.
 * Avoids parsing localized strings like "Jan 2026", which differs per locale.
 */
export function getMonthSortKey(month: number, year: number): number {
  return year * 12 + month;
}

export function addMonths(month: number, year: number, delta: number): { month: number; year: number } {
  const zeroBased = year * 12 + (month - 1) + delta;
  return {
    month: (zeroBased % 12) + 1,
    year: Math.floor(zeroBased / 12),
  };
}

export function getMonthBounds(month: number, year: number): { startDate: string; endDate: string } {
  return {
    startDate: `${year}-${`${month}`.padStart(2, '0')}-01`,
    endDate: `${year}-${`${month}`.padStart(2, '0')}-${getDaysInMonth(month, year)}`,
  };
}

export function shiftMonth(
  month: number,
  year: number,
  delta: number,
): { startDate: string; endDate: string; month: number; year: number } {
  const next = addMonths(month, year, delta);
  return { ...getMonthBounds(next.month, next.year), ...next };
}

export type DateRangePreset = 'all' | 'this-month' | 'last-month' | 'last-7' | 'last-30' | 'this-year';

export const DATE_RANGE_PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: 'all', label: 'All time' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-7', label: 'Last 7 days' },
  { value: 'last-30', label: 'Last 30 days' },
  { value: 'this-year', label: 'This year' },
];

export function getPresetRange(preset: DateRangePreset): { startDate: string; endDate: string } {
  const now = new Date();
  const empty = { startDate: '', endDate: '' };

  switch (preset) {
    case 'this-month':
      return getMonthBounds(getCurrentMonth(), getCurrentYear());
    case 'last-month': {
      const prev = addMonths(getCurrentMonth(), getCurrentYear(), -1);
      return getMonthBounds(prev.month, prev.year);
    }
    case 'last-7': {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { startDate: toISODate(from), endDate: toISODate(now) };
    }
    case 'last-30': {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { startDate: toISODate(from), endDate: toISODate(now) };
    }
    case 'this-year':
      return { startDate: `${getCurrentYear()}-01-01`, endDate: `${getCurrentYear()}-12-31` };
    case 'all':
    default:
      return empty;
  }
}

export function formatDisplayDate(value: string, locale = 'en-US'): string {
  const date = parseISODate(value);
  if (!date) return value;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getWeekdayLabel(value: string, locale = 'en-US'): string {
  const date = parseISODate(value);
  if (!date) return '';
  return date.toLocaleDateString(locale, { weekday: 'short' });
}
