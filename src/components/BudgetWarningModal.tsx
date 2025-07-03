import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface BudgetWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingBudget: number;
  onProceed: () => void;
}

const BudgetWarningModal: React.FC<BudgetWarningModalProps> = ({
  isOpen,
  onClose,
  remainingBudget,
  onProceed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Budget Warning</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="text-slate-600 mb-4 text-sm sm:text-base">
            You still have <span className="font-bold text-emerald-600">${remainingBudget.toFixed(2)}</span> remaining in your budget.
          </p>
          <p className="text-slate-600 text-sm sm:text-base">
            Are you sure you want to add this expense? Consider if this purchase is necessary or if you can save this money for future needs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onProceed}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg shadow-orange-500/25 text-sm sm:text-base"
          >
            Add Expense Anyway
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 text-slate-800 py-3 px-4 rounded-xl font-semibold hover:bg-slate-300 transition-all duration-200 text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetWarningModal;