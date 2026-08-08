import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Sidebar, { ViewKey } from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import Overview from './components/Dashboard/Overview';
import ProfileView from './components/Profile/ProfileView';
import BudgetTracker from './components/BudgetTracker';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseCharts from './components/ExpenseCharts';
import ExpenseFilters from './components/ExpenseFilters';
import AdminPanel from './components/Admin/AdminPanel';
import { useExpenses } from './hooks/useExpenses';

// Note: Admin credentials — admin@admin.com / admin123

function AppContent() {
  const { user, loading: authLoading, isAdmin } = useAuth();
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
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  useEffect(() => {
    if (activeView === 'admin' && !isAdmin) {
      setActiveView('overview');
    }
  }, [isAdmin, activeView]);

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
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <Overview
            expenses={expenses}
            budget={budget}
            loading={loading}
            onDeleteExpense={handleDeleteExpense}
            onManageBudget={() => setActiveView('budget')}
            onViewAllExpenses={() => setActiveView('expenses')}
          />
        );
      case 'add-expense':
        return (
          <div className="max-w-3xl">
            <ExpenseForm
              onAddExpense={handleAddExpense}
              loading={loading}
              budget={budget}
              totalSpent={expenses.reduce((sum, e) => sum + e.amount, 0)}
            />
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-6">
            <ExpenseFilters filters={filters} onFiltersChange={setFilters} />
            <ExpenseList
              expenses={filteredExpenses}
              onDeleteExpense={handleDeleteExpense}
              loading={loading}
            />
          </div>
        );
      case 'analytics':
        return <ExpenseCharts expenses={filteredExpenses} />;
      case 'budget':
        return (
          <div className="max-w-4xl">
            <BudgetTracker
              budget={budget}
              totalSpent={expenses.reduce((sum, e) => sum + e.amount, 0)}
              onBudgetUpdate={handleBudgetUpdate}
            />
          </div>
        );
      case 'admin':
        return isAdmin ? <AdminPanel /> : null;
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeView={activeView}
          onOpenMobile={() => setMobileNavOpen(true)}
          onOpenProfile={() => setActiveView('profile')}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="font-medium flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-rose-600 hover:text-rose-800 font-semibold text-lg leading-none ml-2"
              >
                ×
              </button>
            </div>
          )}

          {renderView()}
        </main>
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
