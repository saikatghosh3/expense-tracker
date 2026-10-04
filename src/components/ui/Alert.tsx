import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

/**
 * Inline message panel used for alerts, warnings, validation errors and hints.
 *
 * Every call site previously hand-wrote the same `flex items-start gap-3`
 * container plus a tinted border/background pair, so the tone colours are now
 * defined once here instead of per component.
 */

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'indigo' | 'accent';

interface ToneStyles {
  surface: string;
  icon: string;
  text: string;
}

const TONES: Record<AlertTone, ToneStyles> = {
  info: {
    surface: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-800 dark:text-blue-300',
  },
  success: {
    surface: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-800 dark:text-emerald-300',
  },
  warning: {
    surface: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-300',
  },
  danger: {
    surface: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30',
    icon: 'text-rose-600 dark:text-rose-400',
    text: 'text-rose-700 dark:text-rose-300',
  },
  indigo: {
    surface: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
    icon: 'text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-900 dark:text-indigo-200',
  },
  accent: {
    surface: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-500/30',
    icon: 'text-fuchsia-600 dark:text-fuchsia-400',
    text: 'text-fuchsia-800 dark:text-fuchsia-300',
  },
};

const DEFAULT_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  indigo: Info,
  accent: Info,
} as const;

export interface AlertProps {
  tone?: AlertTone;
  /** Overrides the icon for the tone. Pass `null` for a text-only panel. */
  icon?: React.ElementType | null;
  /** Replaces the icon entirely, e.g. a custom badge. */
  badge?: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  /** Body size and colour. The tone colour is inherited, so it need not be repeated. */
  bodyClassName?: string;
  /** `md` is the page default; `sm` is the compact sidebar variant. */
  size?: 'sm' | 'md';
  /** `sm` is the standard 16px icon; `lg` suits full-width form errors. */
  iconSize?: 'sm' | 'lg';
  /** Overrides the tinted background + border pair. */
  surfaceClassName?: string;
  /** Rendered on the trailing edge, e.g. dismiss or action buttons. */
  actions?: React.ReactNode;
  role?: 'alert' | 'status';
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  tone = 'info',
  icon,
  badge,
  title,
  children,
  bodyClassName = 'text-xs leading-relaxed',
  size = 'md',
  iconSize = 'sm',
  surfaceClassName,
  actions,
  role,
  className = '',
}) => {
  const styles = TONES[tone];
  const Icon = icon === null ? null : (icon ?? DEFAULT_ICONS[tone]);
  const padding = size === 'sm' ? 'p-3.5' : 'p-4';
  const iconBox = iconSize === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-xl border ${padding} ${
        surfaceClassName ?? styles.surface
      } ${className}`}
    >
      {badge ?? (Icon && <Icon className={`${iconBox} mt-0.5 flex-shrink-0 ${styles.icon}`} />)}

      {(title || children) && (
        <div className={`min-w-0 flex-1 ${styles.text}`}>
          {title && <p className="font-semibold text-sm">{title}</p>}
          {children && <div className={bodyClassName}>{children}</div>}
        </div>
      )}

      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
};

export default Alert;