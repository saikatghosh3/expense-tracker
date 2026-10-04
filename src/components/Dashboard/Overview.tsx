import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, Wallet, TrendingDown, Receipt, ArrowRight, Tag, History } from 'lucide-react';
import type { BudgetStatus, Expense } from '../../types';
import { getCategoryIcon } from '../../constants/categories';
import { getTopCategory, groupByCategory } from '../../utils/expenses';
import { getMonthTotal, getMonthExpenses, sumAmounts } from '../../utils/budget';
import { getMonthLabel } from '../../utils/date';
import { formatDelta } from '../../utils/format';
import { useSettings } from '../../contexts/SettingsContext';
import MetricCard from '../ui/MetricCard';
import { CardHeader, SectionCard } from '../ui/Card';
import BudgetSnapshot from './BudgetSnapshot';
import MonthNavigator from './MonthNavigator';
import ExpenseList from '../ExpenseList';

interface OverviewProps {
  expenses: Expense[];
  budget: number;
  status: BudgetStatus;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  availableMonths: Array<{ month: number; year: number }>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: (month: number, year: number) => void;
  onResetMonth: () => void;
  loading: boolean;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

const Overview: React.FC<OverviewProps> = ({
  expenses,
  budget,
  status,
  month,
  year,
  isCurrentMonth,
  availableMonths,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
  onResetMonth,
  loading,
  onDeleteExpense,
  onEditExpense,
}) => {
  const { formatMoney, formatMoneyWhole } = useSettings();
  const navigate = useNavigate();

  const monthExpenses = useMemo(() => getMonthExpenses(expenses, month, year), [expenses, month, year]);
  const monthSpent = useMemo(() => getMonthTotal(expenses, month, year), [expenses, month, year]);
  const lifetimeSpent = useMemo(() => sumAmounts(expenses), [expenses]);

  const previous = useMemo(() => {
    const zeroBased = year * 12 + (month - 1) - 1;
    const previousMonth = (zeroBased % 12) + 1;
    const previousYear = Math.floor(zeroBased / 12);
    return { total: getMonthTotal(expenses, previousMonth, previousYear), previousMonth, previousYear };
  }, [expenses, month, year]);

  const topCategory = useMemo(() => getTopCategory(monthExpenses), [monthExpenses]);

  const categoryTotals = useMemo(() => groupByCategory(monthExpenses), [monthExpenses]);

  const delta = useMemo(
    () => formatDelta(monthSpent, previous.total),
    [monthSpent, previous.total],
  );

  const avgPerDay = useMemo(() => {
    if (monthSpent === 0) return 0;
    const elapsed = isCurrentMonth ? new Date().getDate() : new Date(year, month, 0).getDate();
    return monthSpent / Math.max(elapsed, 1);
  }, [monthSpent, isCurrentMonth, month, year]);

  const recent = useMemo(
    () => [...monthExpenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 5),
    [monthExpenses],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthNavigator
          month={month}
          year={year}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
          onReset={onResetMonth}
          isCurrent={isCurrentMonth}
          availableMonths={availableMonths}
          onSelect={onSelectMonth}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {monthExpenses.length} {monthExpenses.length === 1 ? 'expense' : 'expenses'} in{' '}
          {getMonthLabel(month, year)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          variant="kpi"
          label="Spent This Month"
          value={formatMoneyWhole(monthSpent)}
          icon={DollarSign}
          gradient="from-indigo-500 to-violet-600"
          delta={delta.text}
          deltaFavourable={delta.direction === 'down' ? true : delta.direction === 'up' ? false : undefined}
          footer={`${monthExpenses.length} ${monthExpenses.length === 1 ? 'transaction' : 'transactions'}`}
        />
        <MetricCard
          variant="kpi"
          label="Monthly Budget"
          value={budget > 0 ? formatMoneyWhole(budget) : 'Not set'}
          icon={Wallet}
          gradient="from-blue-500 to-cyan-500"
          footer={
            budget > 0
              ? `${status.rawPercentage.toFixed(0)}% used`
              : 'Set one to plan ahead'
          }
        />
        <MetricCard
          variant="kpi"
          label={status.remaining >= 0 ? 'Remaining' : 'Over Budget'}
          value={formatMoney(Math.abs(status.remaining))}
          icon={TrendingDown}
          gradient={status.remaining >= 0 ? 'from-emerald-500 to-green-500' : 'from-rose-500 to-red-500'}
          footerTone={status.remaining >= 0 ? 'positive' : 'negative'}
          footer={status.remaining >= 0 ? 'Available this month' : 'Reduce spending'}
        />
        <MetricCard
          variant="kpi"
          label="Daily Average"
          value={formatMoney(avgPerDay)}
          icon={Receipt}
          gradient="from-fuchsia-500 to-pink-500"
          footer={isCurrentMonth ? 'Per day so far' : 'Per day that month'}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0">
          <CardHeader
            size="sm"
            title="Recent Expenses"
            subtitle="Your latest transactions this month"
            action={
              <Link
                to="/expenses"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all flex-shrink-0"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <ExpenseList
            expenses={recent}
            onDeleteExpense={onDeleteExpense}
            onEditExpense={onEditExpense}
            loading={loading}
            showHeader={false}
            isFiltered={false}
          />
        </div>

        <div className="space-y-6">
          <BudgetSnapshot
            budget={budget}
            status={status}
            onManageBudget={() => navigate('/budget')}
            month={month}
            year={year}
          />

          {topCategory && (
            <SectionCard
              as="div"
              padding="p-6"
              spacing=""
              size="sm"
              titleAs="h3"
              icon={Tag}
              gradient="from-amber-500 to-orange-600"
              title="Top Category"
              subtitle="Where most money goes"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg" aria-hidden="true">
                  {getCategoryIcon(topCategory.name)}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{topCategory.name}</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 break-words">
                {formatMoneyWhole(topCategory.value)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {monthSpent > 0 ? ((topCategory.value / monthSpent) * 100).toFixed(0) : 0}% of this month's spending
              </p>
            </SectionCard>
          )}

          {categoryTotals.length > 0 && (
            <SectionCard
              as="div"
              padding="p-6"
              spacing=""
              size="sm"
              titleAs="h3"
              icon={History}
              gradient="from-slate-500 to-slate-700"
              title="All-Time Total"
              subtitle="Everything you have tracked"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 break-words">
                {formatMoneyWhole(lifetimeSpent)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                across {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
