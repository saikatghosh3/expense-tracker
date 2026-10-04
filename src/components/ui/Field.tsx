import React, { createContext, useContext, useId } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Form field primitives.
 *
 * The control's box is owned here rather than by each caller: height, the
 * relative positioning context, and the padding needed to clear any leading
 * icon or trailing adornment are all applied by `Input`/`Select`/`Textarea`
 * from context. That makes it impossible to forget `pl-11` and end up with an
 * icon sitting on top of the text.
 */

type ControlSize = 'sm' | 'md';

interface FieldContextValue {
  controlId: string;
  size: ControlSize;
  /** A leading icon occupies this much padding on the control. */
  hasLeading: boolean;
  /** A trailing adornment occupies this much padding on the control. */
  hasTrailing: boolean;
  invalid: boolean;
  describedBy?: string;
}

const DEFAULT_CONTEXT: FieldContextValue = {
  controlId: '',
  size: 'md',
  hasLeading: false,
  hasTrailing: false,
  invalid: false,
};

const FieldContext = createContext<FieldContextValue>(DEFAULT_CONTEXT);

/**
 * Used inside `FieldGroup`, where each control owns its own label, id and
 * validation state. Only the size is inherited so grouped controls stay the
 * same height as the field they belong to.
 */
export const BareFieldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { size } = useContext(FieldContext);
  return (
    <FieldContext.Provider
      value={{ controlId: '', size, hasLeading: false, hasTrailing: false, invalid: false }}
    >
      {children}
    </FieldContext.Provider>
  );
};

const SIZES: Record<ControlSize, string> = {
  sm: 'h-9',
  md: 'h-11',
};

/**
 * 16px on small screens keeps iOS Safari from zoom-ing the viewport on focus;
 * 15px is the desktop reading size. `sm` stays compact for inline use.
 */
const FONTS: Record<ControlSize, string> = {
  sm: 'text-[0.8125rem]',
  md: 'text-base sm:text-[0.9375rem]',
};

/** Padding that clears a 16px icon sitting 12px from the control edge. */
const LEADING_PAD: Record<ControlSize, string> = { sm: 'pl-9', md: 'pl-11' };
const TRAILING_PAD: Record<ControlSize, string> = { sm: 'pr-9', md: 'pr-11' };
const BASE_PAD = 'px-3.5';

const CONTROL_BASE =
  'block w-full rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ' +
  'transition-[border-color,box-shadow] duration-150 outline-none ' +
  'focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-slate-800/60';

const STATE_NORMAL = 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500';
const STATE_INVALID =
  'border-rose-400 dark:border-rose-500/70 bg-rose-50/60 dark:bg-rose-500/5 focus:ring-rose-500/30 focus:border-rose-500';

/**
 * Combines base, size and contextual padding for any control. Padding is derived
 * from context rather than passed by callers, so an icon or adornment can never
 * end up on top of the text it belongs to.
 */
function controlClasses(
  field: FieldContextValue,
  extra?: string,
  opts: { multiline?: boolean; /** Reserve the trailing gutter even without a `Field` adornment (select chevron). */ trailing?: boolean } = {},
): string {
  const state = field.invalid ? STATE_INVALID : STATE_NORMAL;
  const hasTrailing = field.hasTrailing || opts.trailing === true;

  // Every control keeps a base gutter on both sides; adornments only *add* to it.
  // Omitting the trailing base was what let long values touch the border.
  const padding = opts.multiline
    ? [field.hasLeading ? LEADING_PAD[field.size] : BASE_PAD, 'pr-3.5'].filter(Boolean).join(' ')
    : [
        field.hasLeading ? LEADING_PAD[field.size] : 'pl-3.5',
        hasTrailing ? TRAILING_PAD[field.size] : 'pr-3.5',
      ]
        .filter(Boolean)
        .join(' ');

  return [
    CONTROL_BASE,
    FONTS[field.size],
    opts.multiline ? 'py-3 leading-relaxed' : SIZES[field.size],
    state,
    padding,
    extra ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

function sharedAria(field: FieldContextValue, id: string | undefined) {
  return {
    id: id ?? (field.controlId || undefined),
    'aria-invalid': field.invalid || undefined,
    'aria-describedby': field.describedBy,
  } as const;
}

interface FieldProps {
  label: string;
  /** Overrides the generated control id. */
  htmlFor?: string;
  error?: string;
  hint?: React.ReactNode;
  icon?: React.ElementType;
  /** Rendered inside the control on the trailing edge (e.g. a reveal button). */
  trailing?: React.ReactNode;
  /** Rendered on the message row, right-aligned, below the control. */
  action?: React.ReactNode;
  /** Aligns the icon and padding for multi-line controls. */
  multiline?: boolean;
  size?: ControlSize;
  className?: string;
  children: React.ReactNode;
}

/** Shared validation/help row so `Field` and `FieldSet` stay visually identical. */
const FieldMessage: React.FC<{
  id: string;
  error?: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ id, error, hint, action }) => {
  if (!error && !hint && !action) return null;
  return (
    <div className="mt-1.5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {error && (
          <p id={`${id}-error`} role="alert" className="text-[0.8125rem] font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${id}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  icon: Icon,
  trailing,
  action,
  multiline = false,
  size = 'md',
  className = '',
  children,
}) => {
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  const messageId = error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined;

  const context: FieldContextValue = {
    controlId,
    size,
    hasLeading: Boolean(Icon),
    hasTrailing: Boolean(trailing),
    invalid: Boolean(error),
    describedBy: messageId,
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]';
  const iconOffset = size === 'sm' ? 'left-2.5' : 'left-3.5';
  const iconPosition = multiline ? 'top-3.5' : 'top-1/2 -translate-y-1/2';

  return (
    <FieldContext.Provider value={context}>
      <div className={className}>
        <label
          htmlFor={controlId}
          className="mb-1.5 block text-[0.8125rem] font-medium text-slate-600 dark:text-slate-400"
        >
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <Icon
              aria-hidden="true"
              className={`absolute ${iconOffset} ${iconPosition} ${iconSize} text-slate-400 dark:text-slate-500 pointer-events-none`}
            />
          )}
          {children}
          {trailing && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">{trailing}</div>
          )}
        </div>

        <FieldMessage id={controlId} error={error} hint={hint} action={action} />
      </div>
    </FieldContext.Provider>
  );
};

interface FieldSetProps {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Groups related controls that have no single owning label — a min/max range, for
 * example. The `legend` is the accessible name for the whole group, so each control
 * keeps its own `aria-label` without shadowing the visible text.
 */
export const FieldSet: React.FC<FieldSetProps> = ({ label, error, hint, action, className = '', children }) => {
  const id = useId();
  const { size } = useContext(FieldContext);

  const context: FieldContextValue = {
    controlId: '',
    size,
    hasLeading: false,
    hasTrailing: false,
    invalid: Boolean(error),
    describedBy: undefined,
  };

  return (
    <FieldContext.Provider value={context}>
      <fieldset className={`min-w-0 ${className}`}>
        {/* float + clear makes the legend lay out like an ordinary block label. */}
        <legend className="float-left w-full mb-1.5 text-[0.8125rem] font-medium text-slate-600 dark:text-slate-400">
          {label}
        </legend>
        <div className="clear-both">{children}</div>
        <FieldMessage id={id} error={error} hint={hint} action={action} />
        <div className="clear-both" />
      </fieldset>
    </FieldContext.Provider>
  );
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', id, ...props },
  ref,
) {
  const field = useContext(FieldContext);
  return <input ref={ref} {...sharedAria(field, id)} className={controlClasses(field, className)} {...props} />;
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', id, children, ...props },
  ref,
) {
  const field = useContext(FieldContext);
  return (
    // The wrapper owns the chevron's positioning so the control keeps working
    // anywhere it is placed, including inside a `FieldGroup` grid cell.
    <div className="relative w-full">
      <select
        ref={ref}
        {...sharedAria(field, id)}
        className={controlClasses(field, `${className} appearance-none cursor-pointer`, { trailing: true })}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute ${
          field.size === 'sm' ? 'right-2.5 w-3.5 h-3.5' : 'right-3.5 w-4 h-4'
        } top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500`}
      />
    </div>
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', id, rows = 3, ...props },
  ref,
) {
  const field = useContext(FieldContext);
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...sharedAria(field, id)}
      className={controlClasses(field, className, { multiline: true })}
      {...props}
    />
  );
});

interface FieldGroupProps {
  children: React.ReactNode;
  className?: string;
}

/** Lays out two or more related controls on one row (e.g. a min/max range). */
export const FieldGroup: React.FC<FieldGroupProps> = ({ children, className = '' }) => (
  <BareFieldProvider>
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 ${className}`}
    >
      {children}
    </div>
  </BareFieldProvider>
);