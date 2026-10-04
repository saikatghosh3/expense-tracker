import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Rendered on the trailing edge, e.g. a month navigator or primary action. */
  actions?: React.ReactNode;
  className?: string;
}

/** The title block at the top of every page. Was duplicated across eight pages. */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, className = '' }) => (
  <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

export default PageHeader;