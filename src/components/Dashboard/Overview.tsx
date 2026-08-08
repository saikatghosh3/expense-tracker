import React, { useMemo } from 'react';
import { DollarSign, Wallet, TrendingDown, Receipt, ArrowRight, Tag } from 'lucide-react';
import { Expense } from '../../types';
import StatCard from './StatCard';
import BudgetSnapshot from './BudgetSnapshot';
import ExpenseList from '../ExpenseList';

interface OverviewProps {
  expenses: Expense[];
  budget: number;
  loading: boolean;
  onDeleteExpense: (id: string) => void;
  onManageBudget: () => void;
  onViewAllExpenses: () => void;
}

const Overview: React.FC<OverviewProps> = ({
  expenses,
  budget,
  loading,
  onDeleteExpense,
  onManageBudget,
  onViewAllExpenses,
}) => {
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const remaining = budget - totalSpent;
  const budgetPct = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const topCategory = useMemo(() => {
    if (expenses.length === 0) return null;
    const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    return Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  }, [expenses]);

  const avgPerDay = useMemo(() => {
    if (expenses.length === 0) return 0;
    const now = new Date();
    const day = now.getDate();
    return totalSpent / day;
  }, [expenses, totalSpent]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Spent"
          value={`$${totalSpent.toLocaleString()}`}
          icon={DollarSign}
          gradient="from-indigo-500 to-violet-600"
          footer={`${expenses.length} transactions`}
        />
        <StatCard
          label="Monthly Budget"
          value={budget > 0 ? `$${budget.toLocaleString()}` : 'Not set'}
          icon={Wallet}
          gradient="from-blue-500 to-cyan-500"
          footer={budget > 0 ? `${budgetPct.toFixed(0)}% used` : 'Set one to plan ahead'}
        />
        <StatCard
          label="Remaining"
          value={`$${Math.abs(remaining).toLocaleString()}`}
          icon={TrendingDown}
          gradient={remaining >= 0 ? 'from-emerald-500 to-green-500' : 'from-rose-500 to-red-500'}
          footerTone={remaining >= 0 ? 'positive' : 'negative'}
          footer={remaining >= 0 ? 'Available this month' : 'Over budget'}
        />
        <StatCard
          label="Daily Average"
          value={`$${avgPerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={Receipt}
          gradient="from-fuchsia-500 to-pink-500"
          footer="Per day this month"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Expenses</h2>
              <p className="text-xs text-slate-500">Your latest transactions</p>
            </div>
            <button
              onClick={onViewAllExpenses}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ExpenseList expenses={expenses.slice(0, 5)} onDeleteExpense={onDeleteExpense} loading={loading} />
        </div>

        <div className="space-y-6">
          <BudgetSnapshot budget={budget} totalSpent={totalSpent} onManageBudget={onManageBudget} />

          {topCategory && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Top Category</h3>
                  <p className="text-xs text-slate-500">Where most money goes</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">{topCategory[0]}</p>
              <p className="text-2xl font-bold text-slate-900">
                ${topCategory[1].toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {budget > 0 ? ((topCategory[1] / totalSpent) * 100).toFixed(0) : 0}% of total spending
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
