import React from 'react';

interface ActionTileProps {
  icon: React.ElementType;
  /** Tailwind text colour for the icon, e.g. `text-indigo-600 dark:text-indigo-400`. */
  iconClassName: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Full-width labelled action used by the data-management panels. The four
 * identical button blocks in Settings are now four `ActionTile` entries.
 */
const ActionTile: React.FC<ActionTileProps> = ({
  icon: Icon,
  iconClassName,
  title,
  description,
  onClick,
  disabled = false,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed min-w-0 ${className}`}
  >
    <Icon className={`w-5 h-5 flex-shrink-0 ${iconClassName}`} />

    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
    </div>
  </button>
);

export default ActionTile;