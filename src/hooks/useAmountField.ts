import { useCallback, useMemo, useState } from 'react';

/**
 * Shared state for numeric amount inputs.
 *
 * Budget, category-budget, alert-threshold and expense-amount fields all kept
 * their own copy of "parse the string, decide if it is valid, remember the
 * error", so the rules live here once.
 */

export interface AmountFieldOptions {
  /** Starting text value, e.g. `String(1200)`. */
  initial?: string;
  /** Inclusive lower bound. Defaults to 0. */
  min?: number;
  /** Upper bound. Omit for no limit. */
  max?: number;
  /** When true the value must be strictly greater than `min` (an expense amount). */
  exclusiveMin?: boolean;
  invalidMessage?: string;
  tooLargeMessage?: string;
}

export interface AmountField {
  /** Raw text controlled by the input. */
  value: string;
  setValue: (next: string) => void;
  /** Parsed value, or 0 when the text is empty/unparseable. */
  number: number;
  isEmpty: boolean;
  error: string;
  setError: (next: string) => void;
  /** Returns the parsed amount, or `null` after setting `error`. */
  validate: () => number | null;
  /** Repopulates the field and clears any error. */
  reset: (next?: string) => void;
}

export function useAmountField({
  initial = '',
  min = 0,
  max,
  exclusiveMin = false,
  invalidMessage = 'Enter a valid amount of 0 or more.',
  tooLargeMessage = 'That amount looks too large.',
}: AmountFieldOptions = {}): AmountField {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');

  const isEmpty = value.trim().length === 0;
  const number = useMemo(() => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [value]);

  const validate = useCallback((): number | null => {
    const parsed = Number.parseFloat(value);

    if (isEmpty || !Number.isFinite(parsed) || (exclusiveMin ? parsed <= min : parsed < min)) {
      setError(invalidMessage);
      return null;
    }

    if (max !== undefined && parsed > max) {
      setError(tooLargeMessage);
      return null;
    }

    setError('');
    return parsed;
  }, [isEmpty, value, min, max, exclusiveMin, invalidMessage, tooLargeMessage]);

  const reset = useCallback((next = '') => {
    setValue(next);
    setError('');
  }, []);

  return { value, setValue, number, isEmpty, error, setError, validate, reset };
}

export default useAmountField;