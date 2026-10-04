import React from 'react';
import { Trash2, Pencil, Calendar, Receipt, Store, ArrowUpDown } from 'lucide-react';
import type { Expense } from '../types';
import { getCategoryIcon, getCategoryBadge } from '../constants/categories';
import { useSettings } from '../contexts/SettingsContext';
import { formatDisplayDate } from '../utils/date';
import { EmptyState, CARD_BASE, SectionCard } from './ui/Card';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense?: (expense: Expense) => void;
  loading?: boolean;
  /** Distinguishes "you have no expenses" from "no expenses match your filters". */
  isFiltered?: boolean;
  /** Hides the title/count header when embedded in another card. */
  showHeader?: boolean;
  title?: string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onClearSelection?: () => void;
  /** Removes the internal max-height so pagination controls can sit below it. */
  scrollable?: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDeleteExpense,
  onEditExpense,
  loading = false,
  isFiltered = false,
  showHeader = true,
  title = 'Recent Expenses',
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  scrollable = true,
}) => {
  const { formatMoneyPrecise } = useSettings();

  const allSelected = selectable && expenses.length > 0 && selectedIds?.size === expenses.length;

  if (expenses.length === 0) {
    return (
      <div className={CARD_BASE}>
        {isFiltered ? (
          <EmptyState
            icon={ArrowUpDown}
            title="No matching expenses"
            message="No transactions match your current filters. Try widening the date range or clearing filters."
            gradient="from-indigo-500 to-purple-600"
          />
        ) : (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            message="Add your first expense to start tracking where your money goes."
            actionLabel="Add your first expense"
            actionTo="/add-expense"
          />
        )}
      </div>
    );
  }

  return (
    <SectionCard
      as="div"
      padding=""
      spacing=""
      icon={Receipt}
      gradient="from-orange-600 to-red-600"
      title={showHeader ? title : undefined}
      subtitle={
        showHeader
          ? `${expenses.length} ${expenses.length === 1 ? 'transaction' : 'transactions'}${
              selectedIds && selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''
            }`
          : undefined
      }
      action={
        showHeader && selectable && onToggleSelectAll ? (
          <button
            onClick={onToggleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors flex-shrink-0"
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleSelectAll}
              aria-label={allSelected ? 'Deselect all expenses' : 'Select all expenses'}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
            />
            {allSelected ? 'Clear' : 'Select all'}
          </button>
        ) : undefined
      }
    >
      <div className={`space-y-3 ${scrollable ? 'max-h-96 overflow-y-auto pr-1' : ''}`}>
        {expenses.map((expense) => {
          const checked = selectedIds?.has(expense.id) ?? false;

          return (
            <div
              key={expense.id}
              className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 gap-3 sm:gap-4 ${
                checked
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/40'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {selectable && (
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleSelect?.(expense.id)}
                    aria-label={`Select ${expense.description}`}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                  />
                )}

                <div className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">
                  {getCategoryIcon(expense.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm sm:text-base">
                    {expense.description}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${getCategoryBadge(expense.category)} w-fit`}
                    >
                      {expense.category}
                    </span>
                    {expense.merchant && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Store className="w-3 h-3" />
                        {expense.merchant}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {formatDisplayDate(expense.date)}
                    </span>
                  </div>
                  {expense.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{expense.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
                <span className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {formatMoneyPrecise(expense.amount)}
                </span>

                <div className="flex items-center gap-1">
                  {onEditExpense && (
                    <button
                      onClick={() => onEditExpense(expense)}
                      disabled={loading}
                      aria-label={`Edit ${expense.description}`}
                      title="Edit expense"
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    disabled={loading}
                    aria-label={`Delete ${expense.description}`}
                    title="Delete expense"
                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default ExpenseList;
