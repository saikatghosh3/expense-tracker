import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PieChart as PieChartIcon, TrendingUp, BarChart3, Wallet, Activity, CalendarDays, Trophy } from 'lucide-react';
import type { Expense } from '../../types';
import { CHART_COLORS, getCategoryColor } from '../../constants/categories';
import {
  groupByCategory,
  groupByMonth,
  groupByWeekday,
  getCumulativeTotals,
  getLargestExpense,
} from '../../utils/expenses';
import { getDaysInMonth } from '../../utils/date';
import { ChartCard, ChartTooltip, ChartEmpty, useChartTheme, axisProps } from './ChartKit';

interface ChartProps {
  expenses: Expense[];
}

/* ------------------------------------------------------------------ */
/* 1. Category breakdown                                               */
/* ------------------------------------------------------------------ */

export const CategoryDonut: React.FC<ChartProps> = ({ expenses }) => {
  const theme = useChartTheme();
  const data = useMemo(() => groupByCategory(expenses), [expenses]);

  return (
    <ChartCard
      icon={PieChartIcon}
      gradient="from-purple-600 to-pink-600"
      title="Spending by Category"
      subtitle="Where your money goes"
    >
      {data.length === 0 ? (
        <ChartEmpty message="No spending to break down yet." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="78%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip formatValue={theme.formatMoney} nameFor={() => 'Total'} />
              }
            />
            <Legend
              verticalAlign="bottom"
              height={56}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: theme.axis, fontSize: 12 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Monthly trend                                                    */
/* ------------------------------------------------------------------ */

export const MonthlyTrend: React.FC<ChartProps> = ({ expenses }) => {
  const theme = useChartTheme();
  const data = useMemo(() => groupByMonth(expenses), [expenses]);

  return (
    <ChartCard
      icon={TrendingUp}
      gradient="from-blue-600 to-indigo-600"
      title="Monthly Spending Trend"
      subtitle="Totals across all months"
    >
      {data.length === 0 ? (
        <ChartEmpty message="Add expenses across a few months to see a trend." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis dataKey="label" {...axisProps(theme.axis)} interval="preserveStartEnd" />
            <YAxis {...axisProps(theme.axis)} width={56} tickFormatter={(v: number) => theme.formatMoney(v)} />
            <Tooltip content={<ChartTooltip formatValue={theme.formatMoney} nameFor={() => 'Spent'} />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={CHART_COLORS.primary}
              strokeWidth={3}
              dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Category ranking                                                 */
/* ------------------------------------------------------------------ */

export const CategoryBars: React.FC<ChartProps> = ({ expenses }) => {
  const theme = useChartTheme();
  const data = useMemo(() => groupByCategory(expenses), [expenses]);

  return (
    <ChartCard
      icon={BarChart3}
      gradient="from-emerald-600 to-teal-600"
      title="Category Ranking"
      subtitle="Highest spend first"
    >
      {data.length === 0 ? (
        <ChartEmpty message="No spending recorded yet." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
            <XAxis type="number" {...axisProps(theme.axis)} tickFormatter={(v: number) => theme.formatMoney(v)} />
            <YAxis
              type="category"
              dataKey="name"
              {...axisProps(theme.axis)}
              width={104}
              tick={{ fill: theme.axis, fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip formatValue={theme.formatMoney} nameFor={() => 'Total'} />} cursor={{ fill: theme.grid, opacity: 0.3 }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

/* ------------------------------------------------------------------ */
/* 4. Budget vs actual                                                 */
/* ------------------------------------------------------------------ */

export const BudgetVsActual: React.FC<{ budget: number; spent: number }> = ({ budget, spent }) => {
  const theme = useChartTheme();

  const data = useMemo(
    () => [
      { name: 'Budget', amount: budget },
      { name: 'Actual', amount: spent },
    ],
    [budget, spent],
  );

  const raw = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <ChartCard
      icon={Wallet}
      gradient="from-amber-600 to-orange-600"
      title="Budget vs Actual"
      subtitle={`${raw.toFixed(0)}% of budget consumed`}
    >
      {budget <= 0 ? (
        <ChartEmpty message="Set a monthly budget to compare it against your spending." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis dataKey="name" {...axisProps(theme.axis)} />
            <YAxis {...axisProps(theme.axis)} width={62} tickFormatter={(v: number) => theme.formatMoney(v)} />
            <Tooltip content={<ChartTooltip formatValue={theme.formatMoney} />} cursor={{ fill: theme.grid, opacity: 0.3 }} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} isAnimationActive={false}>
              <Cell fill={CHART_COLORS.budget} />
              <Cell fill={spent > budget ? CHART_COLORS.negative : CHART_COLORS.primary} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Cumulative spend                                                 */
/* ------------------------------------------------------------------ */

export const CumulativeSpend: React.FC<ChartProps & { month: number; year: number; budget: number }> = ({
  expenses,
  month,
  year,
  budget,
}) => {
  const theme = useChartTheme();

  const { data, projected } = useMemo(() => {
    const cumulative = getCumulativeTotals(expenses);
    if (cumulative.length === 0) return { data: [], projected: 0 };

    const daysInMonth = getDaysInMonth(month, year);
    const total = expenses.reduce((total, expense) => total + expense.amount, 0);
    const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() + 1 === month;
    const elapsed = isCurrentMonth ? new Date().getDate() : daysInMonth;
    const monthEndEstimate = elapsed > 0 ? (total / elapsed) * daysInMonth : total;

    // Extend the curve with a single end-of-month marker so the overspend
    // risk (or headroom) is visible at a glance.
    const points = cumulative.map((day) => ({ label: day.label, amount: day.amount }));
    if (cumulative.length > 0 && cumulative.length < daysInMonth) {
      points.push({ label: 'Month end', amount: monthEndEstimate });
    }

    return { data: points, projected: monthEndEstimate };
  }, [expenses, month, year]);

  const willOverspend = budget > 0 && projected > budget;

  return (
    <ChartCard
      icon={Activity}
      gradient="from-cyan-600 to-blue-600"
      title="Cumulative Spend"
      subtitle={
        budget > 0
          ? willOverspend
            ? `Projected to overspend ${theme.formatMoney(projected - budget)}`
            : `Projected ${theme.formatMoney(projected)} by month end`
          : 'Running total through the month'
      }
    >
      {data.length === 0 ? (
        <ChartEmpty message="Add a few expenses to see the cumulative curve." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis dataKey="label" {...axisProps(theme.axis)} interval="preserveStartEnd" minTickGap={28} />
            <YAxis {...axisProps(theme.axis)} width={62} tickFormatter={(v: number) => theme.formatMoney(v)} />
            <Tooltip content={<ChartTooltip formatValue={theme.formatMoney} nameFor={() => 'Cumulative'} />} />
            {budget > 0 && (
              <ReferenceLine
                y={budget}
                stroke={CHART_COLORS.budget}
                strokeDasharray="5 5"
                label={{ value: 'Budget', position: 'right', fill: CHART_COLORS.budget, fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              fill="url(#cumulativeFill)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Weekday distribution                                             */
/* ------------------------------------------------------------------ */

export const WeekdaySpend: React.FC<ChartProps> = ({ expenses }) => {
  const theme = useChartTheme();
  const data = useMemo(() => groupByWeekday(expenses), [expenses]);
  const hasData = data.some((day) => day.count > 0);

  return (
    <ChartCard
      icon={CalendarDays}
      gradient="from-violet-600 to-indigo-600"
      title="Spending by Weekday"
      subtitle="Which days you spend most"
    >
      {!hasData ? (
        <ChartEmpty message="No spending recorded yet." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis dataKey="day" {...axisProps(theme.axis)} />
            <YAxis {...axisProps(theme.axis)} width={56} tickFormatter={(v: number) => theme.formatMoney(v)} />
            <Tooltip
              content={<ChartTooltip formatValue={theme.formatMoney} nameFor={() => 'Spent'} />}
              cursor={{ fill: theme.grid, opacity: 0.3 }}
            />
            <Bar dataKey="amount" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Largest expenses                                                 */
/* ------------------------------------------------------------------ */

export const LargestExpenses: React.FC<ChartProps & { limit?: number }> = ({ expenses, limit = 7 }) => {
  const theme = useChartTheme();

  const data = useMemo(() => {
    const top = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
      .map((expense) => ({
        name: expense.description.length > 22 ? `${expense.description.slice(0, 22)}…` : expense.description,
        amount: expense.amount,
        color: getCategoryColor(expense.category),
      }));
    return top.reverse();
  }, [expenses, limit]);

  const biggest = getLargestExpense(expenses);

  return (
    <ChartCard
      icon={Trophy}
      gradient="from-amber-500 to-yellow-600"
      title="Largest Expenses"
      subtitle={biggest ? `Biggest: ${biggest.description}` : 'Your biggest purchases'}
      height="h-64 sm:h-80"
    >
      {data.length === 0 ? (
        <ChartEmpty message="No expenses to rank yet." />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
            <XAxis type="number" {...axisProps(theme.axis)} tickFormatter={(v: number) => theme.formatMoney(v)} />
            <YAxis
              type="category"
              dataKey="name"
              {...axisProps(theme.axis)}
              width={140}
              tick={{ fill: theme.axis, fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip formatValue={theme.formatMoney} nameFor={() => 'Amount'} />} cursor={{ fill: theme.grid, opacity: 0.3 }} />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};
