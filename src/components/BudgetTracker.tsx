import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, DollarSign, Edit3 } from 'lucide-react';

interface BudgetTrackerProps {
  budget: number;
  totalSpent: number;
  onBudgetUpdate: (budget: number) => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budget, totalSpent, onBudgetUpdate }) => {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget.toString());

  const remaining = budget - totalSpent;
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget >= 0) {
      onBudgetUpdate(newBudget);
      setShowBudgetForm(false);
    }
  };

  const getProgressColor = () => {
    if (percentage <= 60) return 'from-emerald-500 to-green-500';
    if (percentage <= 85) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getStatusColor = () => {
    if (percentage <= 60) return 'text-emerald-600';
    if (percentage <= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (percentage <= 60) return 'bg-emerald-50 border-emerald-200';
    if (percentage <= 85) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Monthly Budget</h2>
        </div>
        <button
          onClick={() => setShowBudgetForm(!showBudgetForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium transition-all duration-200"
        >
          <Edit3 className="w-4 h-4" />
          <span className="text-sm sm:text-base">{budget > 0 ? 'Edit Budget' : 'Set Budget'}</span>
        </button>
      </div>

      {showBudgetForm && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <form onSubmit={handleBudgetSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Enter monthly budget amount"
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              min="0"
              step="0.01"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg shadow-indigo-600/25"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowBudgetForm(false)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {budget > 0 ? (
        <div className="space-y-6">
          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Monthly Budget</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600">${budget.toLocaleString()}</p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Spent</p>
              <p className="text-lg sm:text-xl font-bold text-orange-600">${totalSpent.toLocaleString()}</p>
            </div>
            
            <div className={`rounded-xl p-4 text-center border ${remaining >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${remaining >= 0 ? 'bg-gradient-to-br from-emerald-600 to-green-600' : 'bg-gradient-to-br from-red-600 to-rose-600'}`}>
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Remaining</p>
              <p className={`text-lg sm:text-xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
              <span className={`text-sm font-semibold ${getStatusColor()}`}>
                {percentage.toFixed(1)}% of budget used
              </span>
              {remaining < 0 && (
                <span className="text-sm text-red-600 font-semibold">
                  Over budget by ${Math.abs(remaining).toLocaleString()}
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r transition-all duration-700 ease-out ${getProgressColor()}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Budget Alert */}
          {remaining <= 200 && remaining > 0 && (
            <div className={`p-4 rounded-xl border ${getBgColor()}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-amber-800 mb-1">Budget Alert</p>
                  <p className="text-amber-700 text-sm">You're approaching your budget limit. Consider reviewing your upcoming expenses.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Set Your Monthly Budget</h3>
          <p className="text-slate-600 text-sm sm:text-base px-4">Start tracking your expenses by setting a monthly budget goal</p>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;