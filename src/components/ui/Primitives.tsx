import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Button, spinner and placeholder primitives only.
 *
 * Form control styling lives in `./Field` (`Field`, `Input`, `Select`,
 * `Textarea`). It is intentionally not exported as raw class strings:
 * hand-rolled `pl-10`/`relative` wrappers were the source of overlapping icons
 * and mismatched control heights.
 */

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  /** Renders a router link instead of a `<button>`, using the same styling. */
  to?: string;
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ElementType;
  className?: string;
  title?: string;
  ariaLabel?: string;
}

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-600/25',
  /** Solid indigo, used by page-level "add" CTAs that sit next to a page title. */
  accent: 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm',
  secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
  ghost: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/25',
  success: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700',
} as const;

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-4 py-3.5 text-sm sm:text-base gap-2',
} as const;

/** Icon-only affordances: the header toggles and the month stepper arrows. */
const ICON_SIZES = {
  sm: 'p-1.5',
  md: 'p-2',
} as const;

const ICON_VARIANTS = {
  /** Highlights towards indigo on hover, e.g. theme toggle and page actions. */
  ghost:
    'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
  /** Neutral hover only, e.g. the mobile navigation trigger. */
  muted:
    'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
} as const;

interface IconButtonProps {
  icon: React.ElementType;
  iconClassName?: string;
  onClick?: () => void;
  /** Renders a router link instead of a `<button>`, matching `Button`. */
  to?: string;
  variant?: keyof typeof ICON_VARIANTS;
  size?: keyof typeof ICON_SIZES;
  disabled?: boolean;
  title?: string;
  ariaLabel: string;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  iconClassName = 'w-5 h-5',
  onClick,
  to,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  title,
  ariaLabel,
  className = '',
}) => {
  const classes = `flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${ICON_VARIANTS[variant]} ${ICON_SIZES[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} title={title} aria-label={ariaLabel}>
        <Icon className={iconClassName} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={classes}
    >
      <Icon className={iconClassName} />
    </button>
  );
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  to,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  title,
  ariaLabel,
}) => {
  const isDisabled = disabled || loading;

  const classes = `inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"
          aria-hidden="true"
        />
      ) : (
        Icon && <Icon className="w-4 h-4 flex-shrink-0" />
      )}
      {children}
    </>
  );

  // A link is not a button: nesting one inside the other produces invalid markup
  // and breaks keyboard activation, so `to` swaps the element outright.
  if (to) {
    return (
      <Link to={to} className={classes} title={title} aria-label={ariaLabel} aria-disabled={isDisabled || undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={classes}
    >
      {content}
    </button>
  );
};

export const Spinner: React.FC<{ label?: string; className?: string }> = ({ label, className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    {label && <p className="text-slate-600 dark:text-slate-400 font-medium mt-3">{label}</p>}
  </div>
);

/** Grey placeholder block used while data loads. */
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

/** Full-viewport spinner used while a route or session resolves. */
export const FullScreenLoader: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
    <Spinner label={label} className="py-0" />
  </div>
);
