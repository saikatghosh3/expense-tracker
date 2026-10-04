import React from 'react';

/**
 * Compact status pill, e.g. the `ADMIN` / `YOU` markers next to a user row.
 *
 * The same `rounded-full text-[10px] font-bold` chip was written out three
 * times across the admin and profile screens, so the tone pairs live here.
 */

export type BadgeTone = 'indigo' | 'slate';

const TONES: Record<BadgeTone, string> = {
  indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
  slate: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
};

const Badge: React.FC<{ children: React.ReactNode; tone?: BadgeTone; className?: string }> = ({
  children,
  tone = 'indigo',
  className = '',
}) => (
  <span
    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;