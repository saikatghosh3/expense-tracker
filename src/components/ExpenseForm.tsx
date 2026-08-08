import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, FileText } from 'lucide-react';
import { CATEGORIES } from '../types';
import BudgetWarningModal from './BudgetWarningModal';

interface ExpenseData {
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpenseFormProps {
  onAddExpense: (expense: {
    description: string;
    amount: number;
    category: string;
    date: string;
  }) => void;
  loading: boolean;
  budget: number;
  totalSpent: number;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, loading, budget, totalSpent }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<ExpenseData | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const expenseData = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
    };

    // Check if budget warning should be shown
    const remainingBudget = budget - totalSpent;
    const warningThreshold = 200;

    if (budget > 0 && remainingBudget > 0 && remainingBudget <= warningThreshold) {
      setPendingExpense(expenseData);
      setShowWarningModal(true);
      return;
    }

    proceedWithExpense(expenseData);
  };

  const proceedWithExpense = (expenseData: ExpenseData) => {
    onAddExpense(expenseData);

    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setShowWarningModal(false);
    setPendingExpense(null);
  };

  const handleWarningProceed = () => {
    if (pendingExpense) {
      proceedWithExpense(pendingExpense);
    }
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
    setPendingExpense(null);
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

  const remainingBudget = budget - totalSpent;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Add New Expense</h2>
        </div>

        {budget > 0 && remainingBudget <= 200 && remainingBudget > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-800 text-sm">Budget Alert</p>
                <p className="text-amber-700 text-sm">Only ${remainingBudget.toFixed(2)} remaining in your budget.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="What did you spend on?"
              />
            </div>
            {errors.description && (
              <p className="text-red-600 text-sm mt-1 font-medium">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.amount ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.date ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData({ ...formData, category })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                    formData.category === category
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm sm:text-base">{getCategoryIcon(category)}</span>
                  <span className="truncate">{category}</span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-600 text-sm mt-2 font-medium">{errors.category}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding Expense...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Expense
              </>
            )}
          </button>
        </form>
      </div>

      <BudgetWarningModal
        isOpen={showWarningModal}
        onClose={handleWarningCancel}
        remainingBudget={remainingBudget}
        onProceed={handleWarningProceed}
      />
    </>
  );
};

export default ExpenseForm;