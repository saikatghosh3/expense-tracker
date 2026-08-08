import React from 'react';
import { Target, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetSnapshotProps {
  budget: number;
  totalSpent: number;
  onManageBudget: () => void;
}

const BudgetSnapshot: React.FC<BudgetSnapshotProps> = ({ budget, totalSpent, onManageBudget }) => {
  const remaining = budget - totalSpent;
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const progressColor =
    percentage <= 60 ? 'from-emerald-500 to-green-500' : percentage <= 85 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-red-500';
  const statusText =
    percentage <= 60 ? 'text-emerald-600' : percentage <= 85 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Budget</h3>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          onClick={onManageBudget}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
        >
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {budget > 0 ? (
        <div className="space-y-5">
          <div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Spent this month</p>
                <p className="text-3xl font-bold text-slate-900 leading-tight">${totalSpent.toLocaleString()}</p>
              </div>
              <p className={`text-sm font-bold ${statusText}`}>{percentage.toFixed(1)}%</p>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Budget</p>
              <p className="text-lg font-bold text-slate-900">${budget.toLocaleString()}</p>
            </div>
            <div className={`border rounded-xl p-3.5 ${remaining >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {remaining >= 0 ? 'Remaining' : 'Over by'}
              </p>
              <p className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ${Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </div>

          {remaining <= 200 && remaining > 0 && (
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium text-amber-800">
                Only ${remaining.toLocaleString()} left in your budget this month.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">No budget set yet</h4>
          <p className="text-xs text-slate-500 mb-4">Set a monthly budget to start tracking your limits.</p>
          <button
            onClick={onManageBudget}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Set Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetSnapshot;
