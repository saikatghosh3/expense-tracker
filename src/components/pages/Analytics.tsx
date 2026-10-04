import React from 'react';
import { BarChart3, Layers, PieChart, CalendarDays, TrendingUp } from 'lucide-react';
import {
  CategoryDonut,
  MonthlyTrend,
  CategoryBars,
  BudgetVsActual,
  CumulativeSpend,
  WeekdaySpend,
  LargestExpenses,
} from '../charts';
import { CARD_BASE, EmptyState } from '../ui/Card';
import MetricCard from '../ui/MetricCard';
import PageHeader from '../ui/PageHeader';
import { useExpenses } from '../../hooks/useExpenses';
import { useMonthNavigation } from '../../hooks/useMonthNavigation';
import { useSettings } from '../../contexts/SettingsContext';
import { groupByCategory, groupByWeekday, groupByMonth } from '../../utils/expenses';
import MonthNavigator from '../Dashboard/MonthNavigator';

const Analytics: React.FC = () => {
  const expenses = useExpenses();
  const { formatNumber } = useSettings();
  const { onPrevMonth, onNextMonth, onResetMonth, onSelectMonth } = useMonthNavigation(expenses);

  const categories = groupByCategory(expenses.monthExpenses);
  const weekdays = groupByWeekday(expenses.monthExpenses);
  const months = groupByMonth(expenses.expenses);

  const biggestWeekday = weekdays.reduce<(typeof weekdays)[number] | null>(
    (best, current) => (!best || current.amount > best.amount ? current : best),
    null,
  );

  /** Every chart renders its own `ChartCard`, so the page only supplies the grid. */
  const stats = [
    {
      label: 'Categories Used',
      value: formatNumber(categories.length),
      icon: Layers,
      gradient: 'from-indigo-500 to-violet-600',
    },
    {
      label: 'Transactions',
      value: formatNumber(expenses.monthExpenses.length),
      icon: PieChart,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Busiest Day',
      value: biggestWeekday ? biggestWeekday.day : '—',
      icon: CalendarDays,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Tracked Months',
      value: formatNumber(months.length),
      icon: TrendingUp,
      gradient: 'from-sky-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Where your money is going"
        actions={
          <MonthNavigator
            month={expenses.selectedMonth.month}
            year={expenses.selectedMonth.year}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
            onReset={onResetMonth}
            isCurrent={expenses.isCurrentMonth}
            availableMonths={expenses.availableMonths}
            onSelect={onSelectMonth}
          />
        }
      />

      {expenses.monthExpenses.length === 0 && expenses.loading === false ? (
        <div className={CARD_BASE}>
          <EmptyState
            icon={BarChart3}
            title="No spending in this month"
            message="Add an expense or move to another month to see charts."
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <MetricCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                gradient={stat.gradient}
              />
            ))}
          </div>

          <CategoryDonut expenses={expenses.monthExpenses} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBars expenses={expenses.monthExpenses} />
            <WeekdaySpend expenses={expenses.monthExpenses} />
          </div>

          <MonthlyTrend expenses={expenses.expenses} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LargestExpenses expenses={expenses.monthExpenses} />
            <BudgetVsActual budget={expenses.budget} spent={expenses.monthSpent} />
          </div>

          <CumulativeSpend
            expenses={expenses.monthExpenses}
            month={expenses.selectedMonth.month}
            year={expenses.selectedMonth.year}
            budget={expenses.budget}
          />
        </>
      )}
    </div>
  );
};

export default Analytics;