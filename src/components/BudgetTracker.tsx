import React, { useEffect, useState } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  Edit3,
  Trash2,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES, type Category } from '../types';
import { BUDGET_TIER_STYLES } from '../constants/budget';
import { getCategoryIcon } from '../constants/categories';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrencyPrecise, formatPercent } from '../utils/format';
import type { BudgetStatus } from '../types';
import MonthNavigator from './Dashboard/MonthNavigator';
import { Button } from './ui/Primitives';
import { Field, Input } from './ui/Field';
import { SectionCard } from './ui/Card';
import Alert from './ui/Alert';
import CategoryBadge from './ui/CategoryBadge';
import MetricCard from './ui/MetricCard';
import ProgressBar from './ui/ProgressBar';
import ConfirmDialog from './ui/ConfirmDialog';
import { useToast } from './ui/Toast';
import { useAmountField } from '../hooks/useAmountField';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useConfirmFlag } from '../hooks/useConfirm';

interface BudgetTrackerProps {
  budget: number;
  status: BudgetStatus;
  categoryBudgets: Array<{ category: Category; amount: number }>;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  availableMonths: Array<{ month: number; year: number }>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: (month: number, year: number) => void;
  onResetMonth: () => void;
  onBudgetUpdate: (amount: number) => Promise<void>;
  onBudgetDelete: () => Promise<void>;
  onCategoryBudgetUpdate: (
    category: Category,
    amount: number,
  ) => Promise<void>;
  monthSpentByCategory: Map<Category, number>;
}

const MAX_AMOUNT = 1_000_000_000;
const CATEGORY_ERROR = 'Category budgets must be 0 or more.';

/** Category limits use their own cut-offs rather than the monthly budget tiers. */
function categoryTone(percentage: number) {
  if (percentage > 100) return 'critical' as const;
  if (percentage > 85) return 'warning' as const;
  return 'healthy' as const;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budget,
  status,
  categoryBudgets,
  month,
  year,
  isCurrentMonth,
  availableMonths,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
  onResetMonth,
  onBudgetUpdate,
  onBudgetDelete,
  onCategoryBudgetUpdate,
  monthSpentByCategory,
}) => {
  const { formatMoneyWhole, settings } = useSettings();
  const toast = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null,
  );

  const {
    value: budgetInput,
    setValue: setBudgetInput,
    error: inputError,
    validate: validateBudget,
    reset: resetBudget,
  } = useAmountField({ max: MAX_AMOUNT });

  const {
    value: categoryInput,
    setValue: setCategoryInput,
    validate: validateCategory,
    reset: resetCategory,
  } = useAmountField({ invalidMessage: CATEGORY_ERROR });

  const confirmDelete = useConfirmFlag();

  // Keep the input in step with the budget whenever it changes or the form opens.
  useEffect(() => {
    if (showForm) {
      resetBudget(budget > 0 ? String(budget) : '');
    }
  }, [showForm, budget, resetBudget]);

  const tier = BUDGET_TIER_STYLES[status.tier];

  const { run: saveBudget, pending: saving } = useAsyncAction(
    async (amount: number) => {
      await onBudgetUpdate(amount);
      setShowForm(false);
      toast.success('Budget saved', `Monthly budget set to ${formatMoneyWhole(amount)}.`);
    },
    { errorTitle: 'Could not save budget' },
  );

  const { run: removeBudget } = useAsyncAction(
    async () => {
      await onBudgetDelete();
      confirmDelete.close();
      toast.success('Budget removed', 'You can set a new one at any time.');
    },
    { errorTitle: 'Could not remove budget' },
  );

  const { run: saveCategory } = useAsyncAction(
    async (category: Category, amount: number) => {
      await onCategoryBudgetUpdate(category, amount);
      toast.success('Category budget saved', `${category}: ${formatMoneyWhole(amount)}`);
      setEditingCategory(null);
    },
    { errorTitle: 'Could not save' },
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = validateBudget();
    if (parsed === null) return;

    void saveBudget(parsed);
  };

  const handleDelete = () => {
    void removeBudget();
  };

  const startCategoryEdit = (category: Category) => {
    const existing = categoryBudgets.find(
      (item) => item.category === category,
    );

    setEditingCategory(category);
    resetCategory(existing ? String(existing.amount) : '');
  };

  const handleSaveCategory = (category: Category) => {
    const parsed = validateCategory();

    if (parsed === null) {
      toast.warning('Enter a valid amount', CATEGORY_ERROR);
      return;
    }

    void saveCategory(category, parsed);
  };

  const alertThreshold = settings.alertThreshold;
  const showAlert =
    budget > 0 &&
    status.remaining > 0 &&
    status.remaining <= alertThreshold;

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        {!isCurrentMonth && (
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-right">
            Viewing a past month — edits apply to that month.
          </p>
        )}
      </div>

      {/* Overall budget */}
      <SectionCard
        icon={Target}
        gradient="from-blue-600 to-indigo-600"
        title="Monthly Budget"
        subtitle={
          isCurrentMonth
            ? 'Your overall spending limit'
            : 'Budget for the selected month'
        }
        action={
          <div className="flex items-center gap-1">
            {budget > 0 && (
              <button
                onClick={confirmDelete.open}
                aria-label="Remove budget"
                title="Remove budget"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setShowForm((current) => !current)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
            >
              <Edit3 className="h-4 w-4" />
              {budget > 0 ? 'Edit' : 'Set'}
            </button>
          </div>
        }
      >
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <Field
              label="Monthly budget amount"
              htmlFor="budget-amount"
              error={inputError}
            >
              <Input
                id="budget-amount"
                type="number"
                inputMode="decimal"
                value={budgetInput}
                onChange={(event) =>
                  setBudgetInput(event.target.value)
                }
                placeholder="Enter amount"
                min="0"
                step="0.01"
                autoFocus
              />
            </Field>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="sm:flex-1"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={saving}
                className="sm:flex-1"
              >
                Save Budget
              </Button>
            </div>
          </form>
        )}

        {budget > 0 ? (
          <div className="space-y-6">
            {/* Budget summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard
                variant="highlight"
                label="Monthly Budget"
                value={formatMoneyWhole(budget)}
                icon={Wallet}
                gradient="from-blue-600 to-indigo-600"
                valueClassName="text-blue-600 dark:text-blue-400"
                surfaceClassName="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
              />

              <MetricCard
                variant="highlight"
                label="Spent This Month"
                value={formatMoneyWhole(status.spent)}
                icon={TrendingUp}
                gradient="from-orange-600 to-red-600"
                valueClassName="text-orange-600 dark:text-orange-400"
                surfaceClassName="rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10"
              />

              <MetricCard
                variant="highlight"
                label={status.remaining >= 0 ? 'Remaining' : 'Over By'}
                value={formatMoneyWhole(Math.abs(status.remaining))}
                icon={TrendingDown}
                gradient={
                  status.remaining >= 0
                    ? 'from-emerald-600 to-green-600'
                    : 'from-red-600 to-rose-600'
                }
                valueClassName={
                  status.remaining >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }
                surfaceClassName={`rounded-xl border ${
                  status.remaining >= 0
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                    : 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
                }`}
              />
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className={`text-sm font-semibold ${tier.text}`}>
                  {formatPercent(status.rawPercentage)} of budget used
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tier.surface} ${tier.text}`}
                  >
                    {tier.label}
                  </span>

                  {status.remaining < 0 && (
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Over by{' '}
                      {formatMoneyWhole(
                        Math.abs(status.remaining),
                      )}
                    </span>
                  )}
                </div>
              </div>

              <ProgressBar
                value={status.percentage}
                tone={status.tier}
                size="lg"
                label="Budget used"
                trackClassName="bg-slate-200 dark:bg-slate-700"
              />

              {isCurrentMonth &&
                status.daysRemaining > 0 &&
                status.budget > 0 && (
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {status.daysRemaining}{' '}
                    {status.daysRemaining === 1 ? 'day' : 'days'} left.
                    At this pace you will finish the month at{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrencyPrecise(status.projected)}
                    </span>
                    {status.projected > budget && (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {' '}
                        — over budget
                      </span>
                    )}
                  </p>
                )}
            </div>

            {/* Budget alert */}
            {showAlert && (
              <Alert
                tone="warning"
                surfaceClassName={`rounded-xl border ${tier.surface}`}
                title="Budget Alert"
                bodyClassName="text-sm leading-5 text-amber-700 dark:text-amber-300/90"
                badge={
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500">
                    <span className="text-sm font-bold text-white">!</span>
                  </div>
                }
              >
                {formatCurrencyPrecise(status.remaining)} left — you are close
                to your limit. Consider reviewing upcoming expenses.
              </Alert>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-600 dark:bg-slate-800/50 sm:py-14">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600">
              <Target className="h-8 w-8 text-white" />
            </div>

            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
              No budget set for this month
            </h3>

            <p className="mx-auto max-w-sm px-4 text-sm leading-5 text-slate-600 dark:text-slate-400">
              Set a monthly limit to get alerts before you overspend.
            </p>

            <Button
              className="mt-5"
              onClick={() => setShowForm(true)}
            >
              Set Budget
            </Button>
          </div>
        )}
      </SectionCard>

      {/* Per-category budgets */}
      <SectionCard
        icon={Sparkles}
        gradient="from-fuchsia-600 to-pink-600"
        title="Category Budgets"
        subtitle="Optional limits for individual categories"
        spacing="space-y-5"
      >
        {categoryBudgets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categoryBudgets.map((item) => (
              <CategoryBadge
                key={item.category}
                category={item.category}
                withIcon
              >
                {`${item.category}: ${formatMoneyWhole(item.amount)}`}
              </CategoryBadge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const budgetForCategory = categoryBudgets.find(
              (item) => item.category === category,
            );

            const spentForCategory =
              monthSpentByCategory.get(category) ?? 0;

            const isEditing = editingCategory === category;
            const limit = budgetForCategory?.amount ?? 0;
            const pct = limit > 0 ? (spentForCategory / limit) * 100 : 0;

            return (
              <div
                key={category}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="shrink-0 text-base"
                    aria-hidden="true"
                  >
                    {getCategoryIcon(category)}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {category}
                  </span>

                  <button
                    onClick={() =>
                      isEditing
                        ? setEditingCategory(null)
                        : startCategoryEdit(category)
                    }
                    aria-label={
                      isEditing
                        ? `Cancel editing ${category} budget`
                        : `Edit ${category} budget`
                    }
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                  >
                    {isEditing ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Edit3 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={categoryInput}
                        onChange={(event) =>
                          setCategoryInput(event.target.value)
                        }
                        placeholder="Limit"
                        min="0"
                        step="0.01"
                        aria-label={`${category} budget amount`}
                        autoFocus
                      />
                    </div>

                    <button
                      onClick={() => handleSaveCategory(category)}
                      aria-label={`Save ${category} budget`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {limit > 0 ? (
                        formatMoneyWhole(limit)
                      ) : (
                        <span className="font-medium text-slate-400">
                          No limit
                        </span>
                      )}
                    </p>

                    {limit > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatMoneyWhole(spentForCategory)} spent
                        </p>

                        <ProgressBar
                          value={pct}
                          tone={categoryTone(pct)}
                          size="sm"
                          duration="duration-500"
                          trackClassName="bg-slate-200 dark:bg-slate-700"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          Category limits are independent of your overall budget.{' '}
          <Link
            to="/settings"
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Change the alert threshold in Settings
          </Link>
          .
        </p>
      </SectionCard>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Remove this budget?"
        message="Your budget for this month will be deleted. Your expenses are not affected."
        confirmLabel="Remove Budget"
        destructive
        onConfirm={handleDelete}
        onCancel={confirmDelete.close}
      />
    </div>
  );
};

export default BudgetTracker;