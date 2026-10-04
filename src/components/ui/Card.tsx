import React from 'react';
import { Link } from 'react-router-dom';

/** Shared surface + radius + shadow. The previous literal was duplicated ~12 times. */
export const CARD_BASE =
  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

const CARD_PADDING = 'p-4 sm:p-6';

/** Padding used by every full-width content section on a page. */
const SECTION_PADDING = 'px-5 py-5 sm:px-6 sm:py-6';

/** Header icon badge + title + subtitle. Every panel in the app opens with this. */
export interface CardHeaderProps {
  icon?: React.ElementType;
  gradient?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /**
   * `md` is the page-panel header; `sm` is the compact variant used by dashboard
   * cards; `sidebar` is the tighter variant used by the profile side panel.
   */
  size?: 'sm' | 'md' | 'sidebar';
  /** Heading level, so nested panels keep a sane document outline. */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

const HEADER_SIZES = {
  sm: {
    badge: 'w-10 h-10 rounded-xl',
    icon: 'w-5 h-5',
    title: 'text-base font-bold',
    subtitle: 'text-xs',
    spacing: 'mb-4',
    truncate: false,
  },
  md: {
    badge: 'w-10 h-10 rounded-xl',
    icon: 'w-5 h-5',
    title: 'text-base sm:text-lg font-bold',
    subtitle: 'text-xs sm:text-sm',
    spacing: 'mb-6',
    truncate: true,
  },
  sidebar: {
    badge: 'w-11 h-11 rounded-xl',
    icon: 'w-5 h-5',
    title: 'text-sm font-bold',
    subtitle: 'text-xs mt-0.5',
    spacing: 'mb-5',
    truncate: false,
  },
} as const;

export const CardHeader: React.FC<CardHeaderProps> = ({
  icon: Icon,
  gradient,
  title,
  subtitle,
  action,
  size = 'md',
  titleAs: Title = 'h2',
  className = '',
}) => {
  const styles = HEADER_SIZES[size];
  const truncate = styles.truncate ? ' truncate' : '';

  return (
    <div className={`flex items-center gap-3 ${styles.spacing} ${className}`}>
      {Icon && (
        <div
          className={`${styles.badge} bg-gradient-to-br ${gradient ?? 'from-slate-500 to-slate-700'} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`${styles.icon} text-white`} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Title
          className={`${styles.title} text-slate-900 dark:text-slate-100${truncate}`}
        >
          {title}
        </Title>
        {subtitle && (
          <p className={`${styles.subtitle} text-slate-500 dark:text-slate-400${truncate}`}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

/** Bare padded surface. Prefer `SectionCard` when the panel also has a header. */
export const Card: React.FC<CardProps> = ({ children, className = '', as: Tag = 'div' }) => (
  <Tag className={`${CARD_BASE} ${CARD_PADDING} ${className}`}>{children}</Tag>
);

export interface SectionCardProps
  extends Omit<CardHeaderProps, 'className' | 'title'>,
    Omit<CardProps, 'as' | 'children'> {
  children: React.ReactNode;
  title?: string;
  as?: 'div' | 'section' | 'article' | 'form';
  /** Only used when `as="form"`. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  noValidate?: boolean;
  /** Inner padding. Defaults to the page-panel rhythm. */
  padding?: string;
  /** Vertical rhythm between the header and each child block. */
  spacing?: string;
}

/**
 * The app's standard panel: card surface, consistent padding and an optional
 * icon header. Pass any header prop to render `CardHeader`; omit `title` for a
 * bare surface.
 *
 * The header keeps its own bottom margin, and the body lives in a single
 * `spacing` container, so a panel can never end up with a doubled gap.
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  gradient,
  title,
  subtitle,
  action,
  size,
  titleAs,
  spacing = 'space-y-6',
  padding = SECTION_PADDING,
  className = '',
  as = 'section',
  onSubmit,
  noValidate,
  children,
}) => {
  const surfaceClassName = `${CARD_BASE} ${padding} ${className}`;

  const content = (
    <>
      {title && (
        <CardHeader
          icon={icon}
          gradient={gradient}
          title={title}
          subtitle={subtitle}
          action={action}
          size={size}
          titleAs={titleAs}
        />
      )}
      <div className={spacing}>{children}</div>
    </>
  );

  if (as === 'form') {
    return (
      <form
        className={surfaceClassName}
        onSubmit={onSubmit}
        noValidate={noValidate}
      >
        {content}
      </form>
    );
  }

  const Tag = as;

  return <Tag className={surfaceClassName}>{content}</Tag>;
};

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  gradient?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  gradient = 'from-slate-400 to-slate-600',
}) => (
  <div className="text-center py-10 sm:py-14 px-4">
    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">{message}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-5 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        {actionLabel}
      </button>
    )}
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="mt-5 inline-block px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);