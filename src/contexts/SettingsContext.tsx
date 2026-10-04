import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../data/storage';
import type { Settings, ThemePreference } from '../types';
import { formatCurrency, formatCurrencyPrecise, formatCurrencyWhole, formatNumber } from '../utils/format';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: Settings;
  currency: string;
  updateSettings: (updates: Partial<Settings>) => void;
  /** Currency-aware helpers so no component hardcodes a `$` symbol. */
  formatMoney: (amount: number) => string;
  formatMoneyWhole: (amount: number) => string;
  formatMoneyPrecise: (amount: number) => string;
  /** Locale-aware count formatting for chart axes and stat tiles. */
  formatNumber: (value: number) => string;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [settings, setSettings] = useState<Settings>(() =>
    userId ? storage.getSettings(userId) : storage.getSettings('__anonymous__'),
  );

  useEffect(() => {
    if (userId) setSettings(storage.getSettings(userId));
  }, [userId]);

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  const resolvedTheme = settings.theme === 'system' ? systemTheme : settings.theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const updateSettings = useCallback(
    (updates: Partial<Settings>) => {
      if (!userId) return;
      const next = storage.updateSettings(userId, updates);
      setSettings(next);
    },
    [userId],
  );

  const setTheme = useCallback(
    (theme: ThemePreference) => updateSettings({ theme }),
    [updateSettings],
  );

  const value = useMemo<SettingsContextType>(
    () => ({
      settings,
      currency: settings.currency,
      updateSettings,
      formatMoney: (amount: number) => formatCurrency(amount, settings.currency),
      formatMoneyWhole: (amount: number) => formatCurrencyWhole(amount, settings.currency),
      formatMoneyPrecise: (amount: number) => formatCurrencyPrecise(amount, settings.currency),
      formatNumber: (value: number) => formatNumber(value),
      resolvedTheme,
      setTheme,
    }),
    [settings, updateSettings, resolvedTheme, setTheme],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
