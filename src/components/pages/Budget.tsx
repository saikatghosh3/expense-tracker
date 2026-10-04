import React, { useMemo } from 'react';
import BudgetTracker from '../BudgetTracker';
import PageHeader from '../ui/PageHeader';
import type { Category } from '../../types';
import { useExpenses } from '../../hooks/useExpenses';
import { useMonthNavigation } from '../../hooks/useMonthNavigation';

const Budget: React.FC = () => {
  const expenses = useExpenses();
  const { onPrevMonth, onNextMonth, onResetMonth, onSelectMonth } = useMonthNavigation(expenses);

  /** Per-category totals for the open month, used by the category limit cards. */
  const monthSpentByCategory = useMemo(() => {
    const totals = new Map<Category, number>();
    expenses.monthExpenses.forEach((expense) => {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    });
    return totals;
  }, [expenses.monthExpenses]);

  const categoryBudgets = useMemo(
    () => expenses.categoryBudgets.map((item) => ({ category: item.category, amount: item.amount })),
    [expenses.categoryBudgets],
  );

  // Failures are surfaced by `BudgetTracker`, which owns the toast copy for
  // each action; rethrowing keeps a single error toast instead of two.
  const { updateBudget, deleteBudget, updateCategoryBudget } = expenses;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        subtitle="Set monthly and per-category limits to stay on track."
      />

      <BudgetTracker
        budget={expenses.budget}
        status={expenses.budgetStatus}
        categoryBudgets={categoryBudgets}
        month={expenses.selectedMonth.month}
        year={expenses.selectedMonth.year}
        isCurrentMonth={expenses.isCurrentMonth}
        availableMonths={expenses.availableMonths}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onSelectMonth={onSelectMonth}
        onResetMonth={onResetMonth}
        monthSpentByCategory={monthSpentByCategory}
        onBudgetUpdate={async (amount) => void (await updateBudget(amount))}
        onBudgetDelete={async () => void (await deleteBudget())}
        onCategoryBudgetUpdate={async (category, amount) =>
          void (await updateCategoryBudget(category, amount))
        }
      />
    </div>
  );
};

export default Budget;