import React from 'react';
import { Trash2, Calendar, Receipt } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  loading: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense, loading }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-red-100 text-red-700 border-red-200',
      'Transportation': 'bg-blue-100 text-blue-700 border-blue-200',
      'Shopping': 'bg-purple-100 text-purple-700 border-purple-200',
      'Entertainment': 'bg-pink-100 text-pink-700 border-pink-200',
      'Bills & Utilities': 'bg-orange-100 text-orange-700 border-orange-200',
      'Healthcare': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Travel': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Education': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Other': 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[category] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '⚡',
      'Healthcare': '🏥',
      'Travel': '✈️',
      'Education': '📚',
      'Other': '📦',
    };
    return icons[category] || '📦';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No expenses yet</h3>
          <p className="text-slate-600 text-sm sm:text-base">Start adding your expenses to track your spending</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recent Expenses</h2>
          <p className="text-sm text-slate-600">{expenses.length} transactions</p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="text-xl sm:text-2xl flex-shrink-0">{getCategoryIcon(expense.category)}</div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate text-sm sm:text-base">{expense.description}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getCategoryColor(expense.category)} w-fit`}>
                    {expense.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(expense.date)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                ${expense.amount.toLocaleString()}
              </span>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                disabled={loading}
                className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;