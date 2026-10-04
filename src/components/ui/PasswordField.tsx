import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field, Input } from './Field';

/**
 * Password control with a show/hide toggle in the field's trailing slot.
 *
 * The reveal button and the `type` toggling were hand-copied into every password
 * field in the app; both live here now.
 */

interface PasswordFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  shown: boolean;
  onToggleShown: () => void;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  minLength?: number;
  required?: boolean;
  name?: string;
  /**
   * Replaces the reveal toggle in the trailing slot, e.g. a match hint.
   * Omit for the toggle; pass `null` to render no control at all.
   */
  trailing?: React.ReactNode;
  /** Noun used in the toggle's label, e.g. `confirmation` for a repeat field. */
  revealWord?: string;
  icon?: React.ElementType;
  className?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  id,
  value,
  onChange,
  shown,
  onToggleShown,
  autoComplete,
  placeholder,
  error,
  minLength,
  required,
  name,
  trailing,
  revealWord = 'password',
  icon,
  className,
}) => {
  const revealLabel = `${shown ? 'Hide' : 'Show'} ${revealWord}`;

  // `undefined` means "use the toggle"; `null` means "no trailing control".
  const control =
    trailing === undefined ? (
      <button
        type="button"
        onClick={onToggleShown}
        aria-label={revealLabel}
        title={revealLabel}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    ) : (
      trailing
    );

  return (
    <Field
      label={label}
      htmlFor={id}
      icon={icon}
      error={error}
      className={className}
      trailing={control}
    >
      <Input
        id={id}
        name={name}
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
      />
    </Field>
  );
};

/** Trailing-slot badge for a confirmation field that does not match. */
export const MatchIndicator: React.FC = () => (
  <span
    aria-hidden="true"
    className="inline-flex w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold items-center justify-center"
  >
    !
  </span>
);

export default PasswordField;