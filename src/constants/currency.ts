/**
 * Currencies selectable in Settings.
 *
 * This list drives the settings dropdown and is the only currency catalogue in
 * the app; amounts are formatted through `Intl.NumberFormat` in
 * `utils/format.ts`, so no symbol needs to be stored here.
 *
 * Order is display order — do not reorder without a reason.
 */
export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'PKR', label: 'Pakistani Rupee' },
  { code: 'AED', label: 'UAE Dirham' },
  { code: 'SAR', label: 'Saudi Riyal' },
  { code: 'ZAR', label: 'South African Rand' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'NGN', label: 'Nigerian Naira' },
  { code: 'KES', label: 'Kenyan Shilling' },
  { code: 'BDT', label: 'Bangladeshi Taka' },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['code'];

export const CURRENCY_CODES: readonly string[] = CURRENCY_OPTIONS.map((option) => option.code);

/** `USD — US Dollar`, the shape the settings `<option>` needs. */
export function currencyOptionLabel(code: string, label: string): string {
  return `${code} — ${label}`;
}

export function isSupportedCurrency(code: unknown): code is CurrencyCode {
  return typeof code === 'string' && CURRENCY_CODES.includes(code);
}