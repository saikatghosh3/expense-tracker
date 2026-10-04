import { useCallback, useMemo, useState } from 'react';

/**
 * State for a `ConfirmDialog`.
 *
 * `useConfirm` tracks the record the dialog is about (so the message can name
 * it); `useFlag` is the same thing for dialogs with no payload.
 */

export interface Confirm<T> {
  /** The pending record, or `null` when the dialog is closed. */
  target: T | null;
  isOpen: boolean;
  ask: (target: T) => void;
  close: () => void;
}

export function useConfirm<T>(): Confirm<T> {
  const [target, setTarget] = useState<T | null>(null);

  const ask = useCallback((next: T) => setTarget(next), []);
  const close = useCallback(() => setTarget(null), []);

  return useMemo(() => ({ target, isOpen: target !== null, ask, close }), [target, ask, close]);
}

export interface ConfirmFlag {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export function useConfirmFlag(): ConfirmFlag {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
}