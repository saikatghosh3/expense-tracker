import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePreference } from '../types';

/** Appearance choices rendered as the theme picker in Settings. */
export interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/** Rows per page on the expenses list. `normalizeSettings` enforces the same set. */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;