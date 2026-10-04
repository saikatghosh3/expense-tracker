import { useCallback, useState } from 'react';
import { useToast } from '../components/ui/Toast';

/**
 * Wraps an async handler with pending state and a single failure toast.
 *
 * Roughly fifteen call sites repeated the same `try/catch` +
 * `error instanceof Error ? error.message : undefined` + `toast.error` shape.
 */

export interface AsyncActionOptions {
  /** Toast title shown when the action rejects. */
  errorTitle: string;
}

export interface AsyncAction<Args extends unknown[]> {
  /** Runs the action. Resolves to `false` when it failed. */
  run: (...args: Args) => Promise<boolean>;
  pending: boolean;
}

export function useAsyncAction<Args extends unknown[]>(
  action: (...args: Args) => Promise<unknown>,
  { errorTitle }: AsyncActionOptions,
): AsyncAction<Args> {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (...args: Args): Promise<boolean> => {
      setPending(true);
      try {
        await action(...args);
        return true;
      } catch (error) {
        toast.error(errorTitle, error instanceof Error ? error.message : undefined);
        return false;
      } finally {
        setPending(false);
      }
    },
    [action, errorTitle, toast],
  );

  return { run, pending };
}

export default useAsyncAction;