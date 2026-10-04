import React from 'react';
import { Target, ArrowRight, TrendingUp, PiggyBank } from 'lucide-react';
import type { BudgetStatus } from '../../types';
import { BUDGET_TIER_STYLES } from '../../constants/budget';
import { getMonthLabel } from '../../utils/date';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrencyPrecise } from '../../utils/format';
import { SectionCard } from '../ui/Card';
import Alert from '../ui/Alert';
import ProgressBar from '../ui/ProgressBar';

interface BudgetSnapshotProps {
  budget: number;
  status: BudgetStatus;
  onManageBudget: () => void;
  month: number;
  year: number;
}

const BudgetSnapshot: React.FC<BudgetSnapshotProps> = ({ budget, status, onManageBudget, month, year }) => {
  const { formatMoneyWhole, settings } = useSettings();
  const tier = BUDGET_TIER_STYLES[status.tier];
  const showAlert = budget > 0 && status.remaining > 0 && status.remaining <= settings.alertThreshold;

  return (
    <SectionCard
      as="div"
      padding="p-6"
      size="sm"
      titleAs="h3"
      icon={Target}
      gradient="from-blue-600 to-indigo-600"
      title="Monthly Budget"
      subtitle={getMonthLabel(month, year)}
      action={
        <button
          onClick={onManageBudget}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors flex-shrink-0"
        >
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {budget > 0 ? (
        <div className="space-y-5">
          <div>
            <div className="flex items-end justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Spent this month
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight break-words">
                  {formatMoneyWhole(status.spent)}
                </p>
              </div>
              <p className={`text-sm font-bold flex-shrink-0 ${tier.text}`}>{status.rawPercentage.toFixed(1)}%</p>
            </div>

            <ProgressBar
              value={status.percentage}
              tone={status.tier}
              label="Budget used this month"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Budget
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
                {formatMoneyWhole(budget)}
              </p>
            </div>
            <div
              className={`border rounded-xl p-3.5 ${
                status.remaining >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
              }`}
            >
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {status.remaining >= 0 ? 'Remaining' : 'Over by'}
              </p>
              <p
                className={`text-lg font-bold ${
                  status.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatMoneyWhole(Math.abs(status.remaining))}
              </p>
            </div>
          </div>

          {showAlert && (
            <Alert tone="warning" size="sm" bodyClassName="font-medium">
              Only {formatCurrencyPrecise(status.remaining)} left in your budget
              this month.
            </Alert>
          )}

          {status.daysRemaining > 0 && status.projected > budget && (
            <Alert tone="accent" size="sm" icon={PiggyBank} bodyClassName="font-medium">
              At this pace you will finish the month at {formatCurrencyPrecise(status.projected)} &mdash;{' '}
              {formatCurrencyPrecise(status.projected - budget)} over budget.
            </Alert>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">No budget set yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Set a monthly budget to start tracking your limits.
          </p>
          <button
            onClick={onManageBudget}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Set Budget
          </button>
        </div>
      )}
    </SectionCard>
  );
};

export default BudgetSnapshot;
