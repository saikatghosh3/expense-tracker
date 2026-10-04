import React from 'react';
import type { ElementType } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { SectionCard } from '../ui/Card';

interface ChartCardProps {
  icon: ElementType;
  gradient: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  height?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  icon,
  gradient,
  title,
  subtitle,
  action,
  height = 'h-64 sm:h-80',
  children,
}) => (
  <SectionCard
    as="div"
    padding="p-4 sm:p-6"
    spacing=""
    icon={icon}
    gradient={gradient}
    title={title}
    subtitle={subtitle}
    action={action}
    titleAs="h3"
  >
    <div className={height}>{children}</div>
  </SectionCard>
);

/** Axis / grid colours that follow the active theme. */
export function useChartTheme() {
  const { resolvedTheme, formatMoney } = useSettings();

  return {
    isDark: resolvedTheme === 'dark',
    axis: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b',
    grid: resolvedTheme === 'dark' ? '#334155' : '#e2e8f0',
    text: resolvedTheme === 'dark' ? '#e2e8f0' : '#1e293b',
    surface: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
    border: resolvedTheme === 'dark' ? '#334155' : '#e2e8f0',
    formatMoney,
  };
}

export const axisProps = (stroke: string) => ({
  stroke,
  fontSize: 12,
  fontWeight: 500 as const,
  tickLine: false,
});

interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatValue: (value: number) => string;
  /** Legend label for the series, e.g. "Spent". */
  nameFor?: (key: string | number | undefined) => string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  formatValue,
  nameFor,
}) => {
  const theme = useChartTheme();
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-xl border shadow-lg px-3 py-2 text-sm"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {label !== undefined && (
        <p className="font-semibold mb-1" style={{ color: theme.text }}>
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, index) => {
          const raw = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? 0);
          return (
            <div key={`${entry.dataKey ?? index}`} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color ?? '#6366f1' }}
              />
              <span className="text-xs" style={{ color: theme.axis }}>
                {nameFor ? nameFor(entry.dataKey) : (entry.name ?? 'Amount')}
              </span>
              <span className="text-xs font-semibold ml-auto" style={{ color: theme.text }}>
                {Number.isFinite(raw) ? formatValue(raw) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Consistent empty state for a single chart. */
export const ChartEmpty: React.FC<{ message: string }> = ({ message }) => {
  const theme = useChartTheme();
  return (
    <div className="h-full flex items-center justify-center text-center px-4">
      <p className="text-sm" style={{ color: theme.axis }}>
        {message}
      </p>
    </div>
  );
};
