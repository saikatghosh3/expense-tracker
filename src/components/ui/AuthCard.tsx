import React from 'react';
import Alert from './Alert';

interface AuthCardProps {
  icon: React.ElementType;
  /** Tailwind gradient pair for the badge, e.g. `from-indigo-600 to-violet-600`. */
  gradient: string;
  /** Full glow class for the badge, e.g. `shadow-lg shadow-indigo-600/20`. */
  shadowClass: string;
  title: string;
  subtitle: string;
  error?: string;
  /** Sentence before the mode-switch link, e.g. "Don't have an account?". */
  footerPrompt: React.ReactNode;
  footerActionLabel: string;
  onFooterAction: () => void;
  /** Colour for the mode-switch link so it matches the form's accent. */
  footerActionClassName: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for the sign-in and sign-up forms. Both screens were the same
 * card + centered badge + error slot + "switch mode" footer, duplicated.
 */
const AuthCard: React.FC<AuthCardProps> = ({
  icon: Icon,
  gradient,
  shadowClass,
  title,
  subtitle,
  error,
  footerPrompt,
  footerActionLabel,
  onFooterAction,
  footerActionClassName,
  children,
}) => (
  <div className="w-full max-w-md mx-auto">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
      <div className="text-center mb-6 sm:mb-8">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 ${shadowClass}`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>

        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">{subtitle}</p>
      </div>

      {error && (
        <Alert
          tone="danger"
          icon={null}
          role="alert"
          className="mb-6"
          bodyClassName="text-sm font-medium"
        >
          {error}
        </Alert>
      )}

      {children}

      <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          {footerPrompt}{' '}
          <button
            type="button"
            onClick={onFooterAction}
            className={`font-semibold transition-colors ${footerActionClassName}`}
          >
            {footerActionLabel}
          </button>
        </p>
      </div>
    </div>
  </div>
);

export default AuthCard;