import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Header from './components/Header';
import BudgetTracker from './components/BudgetTracker';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseCharts from './components/ExpenseCharts';
import ExpenseFilters from './components/ExpenseFilters';
import AdminPanel from './components/Admin/AdminPanel';
import { useExpenses } from './hooks/useExpenses';

//  Note Login component has the data to login :admin 



function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const {
    expenses,
    budget,
    loading,
    addExpense,
    deleteExpense,
    updateBudget,
    getFilteredExpenses,
  } = useExpenses();

  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const [error, setError] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  const applyFilters = async () => {
    try {
      const filtered = await getFilteredExpenses(filters);
      setFilteredExpenses(filtered);
    } catch (err) {
      console.error('Filter error:', err);
      setFilteredExpenses(expenses);
    }
  };

  const handleBudgetUpdate = async (newBudget: number) => {
    try {
      await updateBudget(newBudget);
      setError(null);
    } catch (err) {
      setError('Failed to update budget');
      console.error('Budget update error:', err);
    }
  };

  const handleAddExpense = async (expenseData: {
    description: string;
    amount: number;
    category: string;
    date: string;
  }) => {
    try {
      await addExpense(expenseData);
      setError(null);
    } catch (err) {
      setError('Failed to add expense');
      console.error('Add expense error:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setError(null);
    } catch (err) {
      setError('Failed to delete expense');
      console.error('Delete expense error:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <Header
          showAdminPanel={showAdminPanel}
          onToggleAdminPanel={() => setShowAdminPanel(!showAdminPanel)}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-6 sm:mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start sm:items-center gap-3 text-red-700 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="font-medium flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-semibold text-lg leading-none ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Admin Panel */}
        {showAdminPanel && (
          <div className="mb-6 sm:mb-8">
            <AdminPanel />
          </div>
        )}

        {/* Budget Tracker */}
        <div className="mb-6 sm:mb-8">
          <BudgetTracker
            budget={budget}
            totalSpent={totalSpent}
            onBudgetUpdate={handleBudgetUpdate}
          />
        </div>

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Expense Form */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ExpenseForm
              onAddExpense={handleAddExpense}
              loading={loading}
              budget={budget}
              totalSpent={totalSpent}
            />
          </div>

          {/* Expense List */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <ExpenseList
              expenses={filteredExpenses.slice(0, 10)}
              onDeleteExpense={handleDeleteExpense}
              loading={loading}
            />
          </div>
        </div>

        {/* Filters */}
        {expenses.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <ExpenseFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {/* Charts */}
        {expenses.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <ExpenseCharts expenses={filteredExpenses} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm border-t border-slate-200 pt-6 sm:pt-8">
          <p>© 2025 Expense Tracker • Built with React & TypeScript</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;