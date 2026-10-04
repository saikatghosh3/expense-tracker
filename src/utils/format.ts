const currencyCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${currency}|${JSON.stringify(options)}`;
  let formatter = currencyCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency, ...options });
    currencyCache.set(key, formatter);
  }
  return formatter;
}

export function formatCurrency(
  amount: number,
  currency = 'USD',
  options: Intl.NumberFormatOptions = {},
): string {
  if (!Number.isFinite(amount)) return formatCurrency(0, currency, options);
  try {
    return getFormatter(currency, options).format(amount);
  } catch {
    // Unknown currency code — fall back to a plain number with a generic symbol.
    return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
}

/** Whole-currency amounts with no decimals, for dense KPI tiles. */
export function formatCurrencyWhole(amount: number, currency = 'USD'): string {
  return formatCurrency(amount, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Always shows cents, for transaction rows where precision matters. */
export function formatCurrencyPrecise(amount: number, currency = 'USD'): string {
  return formatCurrency(amount, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCompactCurrency(amount: number, currency = 'USD'): string {
  return formatCurrency(amount, currency, { notation: 'compact', maximumFractionDigits: 1 });
}

export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString();
}

/** Percentage change from `previous` to `current`, guarding divide-by-zero. */
export function formatDelta(current: number, previous: number): { text: string; direction: 'up' | 'down' | 'flat' } {
  if (previous === 0) {
    if (current === 0) return { text: 'No change', direction: 'flat' };
    return { text: 'New activity', direction: 'up' };
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(change) < 0.05) return { text: 'No change', direction: 'flat' };
  return {
    text: `${change > 0 ? '+' : ''}${change.toFixed(0)}%`,
    direction: change > 0 ? 'up' : 'down',
  };
}
